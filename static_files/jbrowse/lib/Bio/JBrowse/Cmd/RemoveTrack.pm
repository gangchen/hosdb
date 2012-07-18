=head1 NAME

Script::RemoveTrack - implemention of bin/remove-track.pl

=head1 DESCRIPTION

Do C<perldoc bin/remove-track.pl> to see usage documentation.

=cut

package Bio::JBrowse::Cmd::RemoveTrack;
BEGIN {
  $Bio::JBrowse::Cmd::RemoveTrack::AUTHORITY = 'cpan:RBUELS';
}
{
  $Bio::JBrowse::Cmd::RemoveTrack::VERSION = '1.4.1';
}
use strict;
use warnings;

use JSON 2 ();
use File::Path ();
use File::Spec;

use JsonFileStorage;
use base 'Bio::JBrowse::Cmd';

sub option_defaults {
    ( dir => 'data/' )
}

sub option_definitions {
    (
        shift->SUPER::option_definitions,
        'dir|out=s',
        'quiet|q',
        'delete|D',
        'trackLabel|tracklabel=s@',
    );
}

sub run {
    my ( $self ) = @_;
    for my $label (@{$self->opt('trackLabel')}) {
        $self->delete_track( $label );
    }
}

sub delete_track {
    my ( $self, $trackLabel ) = @_;

    my $deleted_conf;

    # remove the track configuration and print it
    JsonFileStorage->new( $self->opt('dir') )
                   ->modify( 'trackList.json', sub {
                         my ( $json ) = @_;
                         $json or die "The trackList.json file in ".$self->opt('dir')." could not be read.\n";
                         $json->{tracks} = [
                             map {
                                 if( $_->{label} eq $trackLabel ) {
                                     # print the json
                                     $self->print( "removing track configuration:\n".JSON->new->encode( $_ ) );
                                     $deleted_conf = $_;
                                     ()
                                 } else {
                                     $_
                                 }
                             }
                             @{$json->{tracks} || []}
                         ];
                         return $json;
                     });

    if( ! $deleted_conf ) {
        $self->print( "No track found with label $trackLabel" );
        return;
    }

    if( $self->opt('delete') ) {
        # delete the track data
        $self->print( "deleting track data for $trackLabel" );
        my @trackdata_paths = (
            File::Spec->catdir( $self->opt('dir'), 'tracks', $deleted_conf->{label} || die ),
        );
        if( !@trackdata_paths ) {
            $self->print( "Unable to automatically remove track data for $trackLabel (type '$deleted_conf->{type}').  Please remove it manually." );
        } else {
            $self->print( "Deleting data for $trackLabel: @trackdata_paths" );
            File::Path::rmtree( \@trackdata_paths );
        }
    } else {
        $self->print( "--delete not specified; not deleting data directory for $trackLabel" );
    }
}

sub print {
    my $self = shift;
    print( @_, "\n" ) unless $self->opt('quiet');
    return;
}

1;
