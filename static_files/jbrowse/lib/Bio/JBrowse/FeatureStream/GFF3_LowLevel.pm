=head1 NAME

Script::FlatFileToJson::FeatureStream::GFF3_LowLevel - feature stream
class for working with L<Bio::GFF3::LowLevel::Parser> features

=cut

package Bio::JBrowse::FeatureStream::GFF3_LowLevel;
BEGIN {
  $Bio::JBrowse::FeatureStream::GFF3_LowLevel::AUTHORITY = 'cpan:RBUELS';
}
{
  $Bio::JBrowse::FeatureStream::GFF3_LowLevel::VERSION = '1.4.1';
}
use strict;
use warnings;

use base 'Bio::JBrowse::FeatureStream';

sub next_items {
    while ( my $i = $_[0]->{parser}->next_item ) {
        return $i if $i->{child_features};
    }
    return;
}

1;
