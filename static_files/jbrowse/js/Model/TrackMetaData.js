dojo.declare( 'JBrowse.Model.TrackMetaData', null,
/**
 * @lends JBrowse.Model.TrackMetaData.prototype
 */
{

    _noDataValue: '(no data)',

    /**
     * Data store for track metadata, supporting faceted
     * (parameterized) searching.  Keeps all of the track metadata,
     * and the indexes thereof, in memory.
     * @constructs
     * @param args.trackConfigs {Array} array of track configuration
     * @param args.indexFacets {Function|Array|String}
     * @param args.onReady {Function}
     * @param args.metadataStores {Array[dojox.data]}
     */
    constructor: function( args ) {
        // set up our facet name discrimination: what facets we will
        // actually provide search on
        var non_facet_attrs = ['conf'];
        this._filterFacet = (function() {
            var filter = args.indexFacets || function() {return true;};
            // if we have a non-function filter, coerce to an array,
            // then convert that array to a function
            if( typeof filter == 'string' )
                filter = [filter];
            if( Array.isArray( filter ) ) {
                var oldfilter = filter;
                filter = function( facetName) {
                    return dojo.some( oldfilter, function(fn) {
                                         return facetName == fn.toLowerCase();
                                     });
               };
            }
            var ident_facets = this.getIdentityAttributes();
            return function(facetName) {
                return (
                    // always index ident facets
                    dojo.some( ident_facets, function(n) { return n == facetName; } )
                    // otherwise, must pass the user filter AND not be one of our explicitly-blocked attrs
                 || filter(facetName)
                    && ! dojo.some( non_facet_attrs, function(a) { return a == facetName;})
                );
            };
        }).call(this);

        // set up our onReady callbacks to fire once the data is
        // loaded
        if( ! dojo.isArray( args.onReady ) ){
            this.onReadyFuncs = args.onReady ? [ args.onReady ] : [];
        } else {
            this.onReadyFuncs = dojo.clone(args.onReady);
        }

        // interpret the track configurations as a metadata store
        this._indexItems(
            {
                store: this,
                items: dojo.map( args.trackConfigs, function(conf) {
                    var metarecord = dojo.clone( conf.metadata || {} );
                    metarecord.label = conf.label;
                    metarecord.key = conf.key;
                    metarecord.conf = conf;
                    if( conf.category )
                        metarecord.category = conf.category;
                    return metarecord;
                },this)
            }
        );

        // fetch and index all the items from each of the stores
        var stores_fetched_count = 0;
        // filter out empty metadata store entries
        args.metadataStores = dojo.filter( args.metadataStores, function(s) { return s; } );
        if( ! args.metadataStores || ! args.metadataStores.length ) {
            // if we don't actually have any stores besides the track
            // confs, we're ready now.
            this._finishLoad();
        } else  {
            // index the track metadata from each of the stores

            var storeFetchFinished = dojo.hitch( this, function() {
                if( ++stores_fetched_count == args.metadataStores.length )
                    this._finishLoad();
            });
            dojo.forEach( args.metadataStores, function(store) {
                store.fetch({
                    scope: this,
                    onComplete: dojo.hitch( this, function(items) {
                        // build our indexes
                        this._indexItems({ store: store, items: items, supplementalOnly: true });

                        // if this is the last store to be fetched, call
                        // our onReady callbacks
                        storeFetchFinished();
                    }),
                    onError: function(e) {
                        console.error(''+e);
                        storeFetchFinished();
                    }
                });
            },this);
        }
     },

    /**
     * Set the store's state to be ready (i.e. loaded), and calls all
     * our onReady callbacks.
     * @private
     */
    _finishLoad: function() {

        // sort the facet names
        this.facets.sort();

        // calculate the average bucket size for each facet index
        dojo.forEach( dojof.values( this.facetIndexes.byName ), function(bucket) {
            bucket.avgBucketSize = bucket.itemCount / bucket.bucketCount;
        });
        // calculate the rank of the facets: make an array of
        // facet names sorted by bucket size, descending
        this.facetIndexes.facetRank = dojo.clone(this.facets).sort(dojo.hitch(this,function(a,b){
            return this.facetIndexes.byName[a].avgBucketSize - this.facetIndexes.byName[b].avgBucketSize;
        }));

        // sort the facet indexes by ident, so that we can do our
        // kind-of-efficient N-way merging when querying
        var itemSortFunction = dojo.hitch( this, '_itemSortFunc' );
        dojo.forEach( dojof.values( this.facetIndexes.byName ), function( facetIndex ) {
            dojo.forEach( dojof.keys( facetIndex.byValue ), function( value ) {
                facetIndex.byValue[value].items = facetIndex.byValue[value].items.sort( itemSortFunction );
            });
        },this);

        this.ready = true;
        this._onReady();
    },

    _itemSortFunc: function(a,b) {
            var ai = this.getIdentity(a),
                bi = this.getIdentity(b);
            return ai == bi ?  0 :
                   ai  > bi ?  1 :
                   ai  < bi ? -1 : 0;
    },

    _indexItems: function( args ) {
        // get our (filtered) list of facets we will index for
        var store = args.store,
            items = args.items;

        var storeAttributes = {};

        // convert the items to a uniform format
        items = dojo.map( items, function( item ) {
                              var itemattrs = store.getAttributes(item);

                              //convert the item into a uniform data format of plain objects
                              var newitem = {};
                              dojo.forEach( itemattrs, function(attr) {
                                                var lcattr = attr.toLowerCase();
                                                storeAttributes[lcattr] = true;
                                                newitem[lcattr] = store.getValue(item,attr);
                                            });
                              return newitem;
                          },
                          this
                        );

        // merge them with any existing records, filtering out ones
        // that should be ignored if we were passed
        // 'supplementalOnly', and update the identity index
        this.identIndex = this.identIndex || {};
        items = (function() {
            var seenInThisStore = {};
            return dojo.map( items, function(item) {
                                 // merge the new item attributes with any existing
                                 // record for this item
                                 var ident = this.getIdentity(item);
                                 var existingItem = this.identIndex[ ident ];

                                 // skip this item if we have already
                                 // seen it from this store, or if we
                                 // are supplementalOnly and it
                                 // does not already exist
                                 if( seenInThisStore[ident] || args.supplementalOnly && !existingItem) {
                                     return null;
                                 }
                                 seenInThisStore[ident] = true;

                                 return this.identIndex[ ident ] = dojo.mixin( existingItem || {}, item );
                             },
                             this
                           );
        }).call(this);

        // filter out nulls
        items = dojo.filter( items, function(i) { return i;});

        // update our facet list to include any new attrs these
        // items have
        var new_facets = this._addFacets( dojof.keys( storeAttributes ) );

        // initialize indexes for any new facets
        this.facetIndexes = this.facetIndexes || { itemCount: 0, bucketCount: 0, byName: {} };
        dojo.forEach( new_facets, function(facet) {
            if( ! this.facetIndexes.byName[facet] ) {
                this.facetIndexes.bucketCount++;
                this.facetIndexes.byName[facet] = { itemCount: 0, bucketCount: 0, byValue: {} };
            }
        }, this);

        // now update the indexes with the new facets
        if( new_facets.length ) {
            var gotDataForItem = {};
            dojo.forEach( new_facets, function(f){ gotDataForItem[f] = {};});

            dojo.forEach( items, function( item ) {
                this.facetIndexes.itemCount++;
                dojo.forEach( new_facets, function( facet ) {
                    var value = this.getValue( item, facet, undefined );
                    if( typeof value == 'undefined' )
                        return;
                    gotDataForItem[facet][this.getIdentity(item)] = 1;
                    this._indexItem( facet, value, item );
                },this);
            }, this);

            // index the items that do not have data for this facet
            dojo.forEach( new_facets, function(facet) {
                var gotSomeWithNoData = false;
                dojo.forEach( dojof.values( this.identIndex ), function(item) {
                    if( ! gotDataForItem[facet][this.getIdentity(item)] ) {
                        gotSomeWithNoData = true;
                        this._indexItem( facet, this._noDataValue, item );
                    }
                },this);
            },this);
        }
    },

    /**
     * Add an item to the indexes for the given facet name and value.
     * @private
     */
    _indexItem: function( facet, value, item ) {
        var facetValues = this.facetIndexes.byName[facet];
        var bucket = facetValues.byValue[value];
        if( !bucket ) {
            bucket = facetValues.byValue[value] = { itemCount: 0, items: [] };
            facetValues.bucketCount++;
        }
        bucket.itemCount++;
        facetValues.itemCount++;
        bucket.items.push(item);
    },

    /**
     * Given an array of string facet names, add records for them,
     * initializing the necessary data structures.
     * @private
     * @returns {Array[String]} facet names that did not already exist
     */
    _addFacets: function( facetNames ) {
        var old_facets = this.facets || [];
        var seen = {};
        this.facets = dojo.filter(
            old_facets.concat( facetNames ),
            function(facetName) {
                var take = this._filterFacet(facetName) && !seen[facetName];
                seen[facetName] = true;
                return take;
            },
            this
        );
        return this.facets.slice( old_facets.length );
    },

    /**
     * Get the number of items that matched the most recent query.
     * @returns {Number} the item count, or undefined if there has not
     * been any query so far.
     */
    getCount: function() {
        return this._fetchCount;
    },


    /**
     * @param facetName {String} facet name
     * @returns {Object}
     */
    getFacetCounts: function( facetName ) {
        var context = this._fetchFacetCounts[ facetName ] || this._fetchFacetCounts[ '__other__' ];
        return context ? context[facetName] : undefined;
    },

    /**
     * Get an array of the text names of the facets that are defined
     * in this track metadata.
     * @param callback {Function} called as callback( [facet,facet,...] )
     */
    getFacetNames: function( callback ) {
        return this.facets;
    },

    /**
     * Get an Array of the distinct values for a given facet name.
     * @param facetName {String} the facet name
     * @returns {Array} distinct values for that facet
     */
    getFacetValues: function( facetName ) {
        var index = this.facetIndexes.byName[facetName];
        if( !index )
            return [];

        return dojof.keys( index.byValue );
    },

    /**
     * Get statistics about the facet with the given name.
     * @returns {Object} as: <code>{ itemCount: ##, bucketCount: ##, avgBucketSize: ## }</code>
     */
    getFacetStats: function( facetName ) {
        var index = this.facetIndexes.byName[facetName];
        if( !index ) return {};

        var stats = {};
        dojo.forEach( ['itemCount','bucketCount','avgBucketSize'],
                      function(attr) { stats[attr] = index[attr]; }
                    );
        return stats;
    },

    // dojo.data.api.Read support

    getValue: function( i, attr, defaultValue ) {
        var v = i[attr];
        return typeof v == 'undefined' ? defaultValue : v;
    },
    getValues: function( i, attr ) {
        var a = [ i[attr] ];
        return typeof a[0] == 'undefined' ? [] : a;
    },

    getAttributes: function(item)  {
        return dojof.keys( item );
    },

    hasAttribute: function(item,attr) {
        return item.hasOwnProperty(attr);
    },

    containsValue: function(item, attribute, value) {
        return item[attribute] == value;
    },

    isItem: function(item) {
        return typeof item == 'object' && typeof item.label == 'string';
    },

    isItemLoaded: function() {
        return true;
    },

    loadItem: function( args ) {
    },

    // used by the dojo.data.util.simpleFetch mixin to implement fetch()
    _fetchItems: function( keywordArgs, findCallback, errorCallback ) {
        if( ! this.ready ) {
            this.onReady( dojo.hitch( this, '_fetchItems', keywordArgs, findCallback, errorCallback ) );
            return;
        }

        var query = dojo.clone( keywordArgs.query || {} );
        // coerce query arguments to arrays if they are not already arrays
        dojo.forEach( dojof.keys( query ), function(qattr) {
            if( ! Array.isArray( query[qattr] ) ) {
                query[qattr] = [ query[qattr] ];
            }
        },this);

        var results;
        var queryFingerprint = Util.objectFingerprint( query );
        if( queryFingerprint == this.previousQueryFingerprint ) {
            results = this.previousResults;
        } else {
            this.previousQueryFingerprint = queryFingerprint;
            this.previousResults = results = this._doQuery( query );
        }

        // and finally, hand them to the finding callback
        findCallback(results,keywordArgs);
        this.onFetchSuccess();
    },

    /**
     * @private
     */
    _doQuery: function( /**Object*/ query ) {

        var textFilter = this._compileTextFilter( query.text );
        delete query.text;

        // algorithm pseudocode:
        //
        //    * for each individual facet, get a set of tracks that
        //      matches its selected values.  sort each set by the
        //      track's unique identifier.
        //    * while still need to go through all the items in the filtered sets:
        //          - if all the facets have the same track first in their sorted set:
        //                 add it to the core result set.
        //                 count it in the global counts
        //          - if all the facets *but one* have the same track first:
        //                 this track will need to be counted in the
        //                 'leave-out' counts for the odd facet out.  count it.
        //          - shift the lowest-labeled track off of whatever facets have it at the front

        var results = []; // array of items that completely match the query

        // construct the filtered sets (arrays of items) for each of
        // our search criteria
        var filteredSets = [];
        if( textFilter ) {
            filteredSets.push(
                dojo.filter( dojof.values( this.identIndex ), textFilter )
                    .sort( dojo.hitch(this,'_itemSortFunc') )
            );
            filteredSets[0].facetName = 'Contains text';
        }
        filteredSets.push.apply( filteredSets,
                dojo.map( dojof.keys( query ), function( facetName ) {
                    var values = query[facetName];
                    var items = [];
                    if( ! this.facetIndexes.byName[facetName] ) {
                        console.error( "No facet defined with name '"+facetName+"'." );
                        throw "No facet defined with name '"+facetName+"', faceted search failed.";
                    }
                    dojo.forEach( values, function(value) {
                        var idx = this.facetIndexes.byName[facetName].byValue[value] || {};
                        items.push.apply( items, idx.items || [] );
                    },this);
                    items.facetName = facetName;
                    items.sort( dojo.hitch( this, '_itemSortFunc' ));
                    return items;
                },this)
        );
        dojo.forEach( filteredSets, function(s) {
            s.myOffset = 0;
            s.topItem = function() { return this[this.myOffset]; };
            s.shift   = function() { this.myOffset++; };
        });

        // init counts
        var facetMatchCounts   = {};

        if( ! filteredSets.length ) {
            results = dojof.values( this.identIndex );
        } else {
            // calculate how many item records total we need to go through
            var leftToProcess = 0;
            dojo.forEach( filteredSets,
                          function(s) { leftToProcess += s.length;} );

            // do a sort of N-way merge of the filtered sets
            while( leftToProcess ) {

                // look at the top of each of our sets, seeing what items
                // we have there.  group the sets by the identity of their
                // topmost item.
                var setsByTopIdent = {}, uniqueIdents = [], ident, item;
                dojo.forEach(filteredSets, function(set,i) {
                    item = set.topItem();
                    ident = item ? this.getIdentity( item ) : '(at end of set)';
                    if( setsByTopIdent[ ident ] ) {
                        setsByTopIdent[ ident ].push( set );
                    } else {
                        setsByTopIdent[ ident ] = [set];
                        uniqueIdents.push( ident );
                    }
                },this);
                if( uniqueIdents.length == 1 ) {
                    // each of our matched sets has the same item at the
                    // top.  this means it is part of the core result set.
                    results.push( item );
                } else {

                    // ident we are operating on is always the
                    // lexically-first one that is not the end-of-set
                    // marker
                    uniqueIdents.sort();
                    var leftOutIndex;
                    if( uniqueIdents[0] == '(at end of set)' ) {
                        ident = uniqueIdents[1];
                        leftOutIndex = 0;
                    } else {
                        ident = uniqueIdents[0];
                        leftOutIndex = 1;
                    }
                    ident = uniqueIdents[0] == '(at end of set)' ? uniqueIdents[1] : uniqueIdents[0];

                    if( uniqueIdents.length == 2
                        && setsByTopIdent[ ident ].length == filteredSets.length - 1 ) {
                        // all of the matched sets except one has the same
                        // item on top, and it is the lowest-labeled item

                        var leftOutSet = setsByTopIdent[ uniqueIdents[ leftOutIndex ] ][0];
                        this._countItem( facetMatchCounts, setsByTopIdent[ident][0].topItem(), leftOutSet.facetName );
                    }
                }

                dojo.forEach( setsByTopIdent[ ident ], function(s) { s.shift(); leftToProcess--; });
            }
        }

        // each of the leave-one-out count sets needs to also have the
        // core result set counted in it, and also make a counting set
        // for the core result set (used by __other__ facets not
        // involved in the query)
        dojo.forEach( dojof.keys(facetMatchCounts).concat( ['__other__'] ), function(category) {
            dojo.forEach( results, function(item) {
                 this._countItem( facetMatchCounts, item, category);
            },this);
        },this);

        // in the case of just one filtered set, the 'leave-one-out'
        // count for it is actually the count of all results, so we
        // need to make a special little count of that attribute for
        // the global result set.
        if( filteredSets.length == 1 ) {
            dojo.forEach( dojof.values( this.identIndex ), function(item) {
                this._countItem( facetMatchCounts, item, filteredSets[0].facetName );
            },this);
        }

        this._fetchFacetCounts = facetMatchCounts;
        this._fetchCount = results.length;
        return results;
    },

    _countItem: function( facetMatchCounts, item, facetName ) {
        var facetEntry = facetMatchCounts[facetName];
        if( !facetEntry ) facetEntry = facetMatchCounts[facetName] = {};
        var facets = facetName == '__other__' ? this.facets : [facetName];
        dojo.forEach( facets, function(attrName) {
            var value = this.getValue( item, attrName, this._noDataValue );
            var attrEntry = facetEntry[attrName];
            if( !attrEntry ) {
                attrEntry = facetEntry[attrName] = {};
                attrEntry[value] = 0;
            }
            attrEntry[value] = ( attrEntry[value] || 0 ) + 1;
        },this);
    },

    onReady: function( scope, func ) {
        scope = scope || dojo.global;
        func = dojo.hitch( scope, func );
        if( ! this.ready ) {
            this.onReadyFuncs.push( func );
            return;
        } else {
            func();
        }
    },

    /**
     * Event hook called once when the store is initialized and has
     * an initial set of data loaded.
     */
    _onReady: function() {
        dojo.forEach( this.onReadyFuncs || [], function(func) {
            func.call();
        });
    },

    /**
     * Event hook called after a fetch has been successfully completed
     * on this store.
     */
    onFetchSuccess: function() {
    },

    /**
     * Compile a text search string into a function that tests whether
     * a given piece of text matches that search string.
     * @private
     */
    _compileTextFilter: function( textString ) {
        if( textString === undefined )
            return null;

        // parse out words and quoted words, and convert each into a regexp
        var rQuotedWord = /\s*["']([^"']+)["']\s*/g;
        var rWord = /(\S+)/g;
        var parseWord = function() {
            var word = rQuotedWord.exec( textString ) || rWord.exec( textString );
            if( word ) {
                word = word[1];
                var lastIndex = Math.max( rQuotedWord.lastIndex, rWord.lastIndex );
                rWord.lastIndex = rQuotedWord.lastIndex = lastIndex;
            }
            return word;
        };
        var wordREs = [];
        var currentWord;
        while( (currentWord = parseWord()) ) {
            // escape regex control chars, and convert glob-like chars to
            // their regex equivalents
            currentWord = dojo.regexp.escapeString( currentWord, '*?' )
                              .replace(/\*/g,'.+')
                              .replace(/ /g,'\\s+')
                              .replace(/\?/g,'.');
            wordREs.push( new RegExp(currentWord,'i') );
        }

        // return a function that takes on item and returns true if it
        // matches the text filter
        return dojo.hitch(this, function(item) {
            return dojo.some( this.facets, function(facetName) {
                       var text = this.getValue( item, facetName );
                       return dojof.every( wordREs, function(re) { return re.test(text); } );
            },this);
        });
    },

    getFeatures: function() {
        return {
	    'dojo.data.api.Read': true,
	    'dojo.data.api.Identity': true
	};
    },
    close: function() {},

    getLabel: function(i) {
        return this.getValue(i,'key',undefined);
    },
    getLabelAttributes: function(i) {
        return ['key'];
    },

    // dojo.data.api.Identity support
    getIdentityAttributes: function() {
        return ['label'];
    },
    getIdentity: function(i) {
        return this.getValue(i, 'label', undefined);
    },
    fetchItemByIdentity: function(id) {
        return this.identIndex[id];
    }
});
dojo.require('dojo.data.util.simpleFetch');
dojo.extend( JBrowse.Model.TrackMetaData, dojo.data.util.simpleFetch );