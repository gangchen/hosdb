package Bio::JBrowse::Cmd::NCFormatter;
BEGIN {
  $Bio::JBrowse::Cmd::NCFormatter::AUTHORITY = 'cpan:RBUELS';
}
{
  $Bio::JBrowse::Cmd::NCFormatter::VERSION = '1.4.1';
}

use base 'Bio::JBrowse::Cmd';

use GenomeDB;
use ExternalSorter;

sub _format {
    my ( $self, %args ) = @_;
    my ( $trackLabel, $trackConfig, $feature_stream, $filter ) = @args{qw{ trackLabel trackConfig featureStream featureFilter }};
    $filter ||= sub { @_ };

    my $types = $self->opt('type');
    @$types = split /,/, join ',', @$types;

    # The ExternalSorter will get flattened [chrom, [start, end, ...]]
    # arrays from the feature_stream
    my $sorter = ExternalSorter->new(
        do {
            my $startIndex = $feature_stream->startIndex;
            my $endIndex = $feature_stream->endIndex;
            sub ($$) {
                $_[0]->[0] cmp $_[1]->[0]
                    ||
                $_[0]->[1]->[$startIndex] <=> $_[1]->[1]->[$startIndex]
                    ||
                $_[1]->[1]->[$endIndex] <=> $_[0]->[1]->[$endIndex];
            }
        },
        $self->opt('sortMem'),
    );

    my %featureCounts;
    while ( my @feats = $feature_stream->next_items ) {

        for my $feat ( $filter->( @feats ) ) {
            my $chrom = $feat->{seq_id};
            $featureCounts{$chrom} += 1;

            my $row = [ $chrom,
                        $feature_stream->flatten_to_feature( $feat ),
                        $feature_stream->flatten_to_name( $feat ),
                        ];
            $sorter->add( $row );
        }
    }
    $sorter->finish();

    ################################

    my $gdb = GenomeDB->new( $self->opt('out') );

    my $track = $gdb->getTrack( $trackLabel, { %$trackConfig, type => 'FeatureTrack' }, $trackConfig->{key} )
                || $gdb->createFeatureTrack( $trackLabel,
                                             $trackConfig,
                                             $trackConfig->{key},
                                           );

    my $curChrom = 'NONE YET';
    my $totalMatches = 0;
    while( my $feat = $sorter->get ) {

        use Storable ();
        unless( $curChrom eq $feat->[0] ) {
            $curChrom = $feat->[0];
            $track->finishLoad; #< does nothing if no load happening
            $track->startLoad( $curChrom,
                               $self->opt('nclChunk'),
                               Storable::dclone( $feature_stream->arrayReprClasses ),
                             );
        }
        $totalMatches++;
        $track->addSorted( $feat->[1] );

        # load the feature's name record into the track if necessary
        if( my $namerec = $feat->[2] ) {
            $track->nameHandler->addName( $namerec );
        }
    }

    $gdb->writeTrackEntry( $track );

    # If no features are found, check for mistakes in user input
    if( !$totalMatches && @$types ) {
        warn "WARNING: No matching features found for @$types\n";
    }
}

1;
