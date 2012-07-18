=head1 NAME

FeatureStream - base class for feature streams
used for handling features inside FlatFileToJson.pm

=cut

package Bio::JBrowse::FeatureStream;
BEGIN {
  $Bio::JBrowse::FeatureStream::AUTHORITY = 'cpan:RBUELS';
}
{
  $Bio::JBrowse::FeatureStream::VERSION = '1.4.1';
}
use strict;
use warnings;

use Digest::MurmurHash ();

sub new {
    my $class = shift;

    my $self = bless {
        @_,
        class_count => 0
    }, $class;

    return $self;
}

sub flatten_to_feature {
    my ( $self, $f ) = @_;
    my $subfeatures =  [ map $self->flatten_to_feature($_), @{$f->{child_features}} ];

    my $class = $self->_get_class( $f );

    my @f = ( $class->{index},
              @{$f}{ $self->_fixed_fields },
              (map $f->{attributes}{$_}[0], @{$class->{variable_fields}}),
              $subfeatures
            );

    # convert start to interbase and numify it
    $f[1] -= 1;
    # numify end
    $f[2] += 0;
    # convert strand to 1/0/-1/undef if necessary, and numify it
    no warnings 'uninitialized';
    $f[3] = { '+' => 1, '-' => -1 }->{$f[3]} || $f[3] || undef;
    $f[3] += 0;
    return \@f;
}

sub _fixed_fields {
    return qw{ start end strand source phase type score };
}

sub _get_class {
    my ( $self, $f ) = @_;

    my @attrs = keys %{$f->{attributes}};
    my $attr_fingerprint = Digest::MurmurHash::murmur_hash( join '-', @attrs );

    return $self->{classes}{$attr_fingerprint} ||= {
        index  => $self->{class_count}++, # the classes start from 1.  so what.
        fields => [ $self->_fixed_fields, @attrs],
        fixed_fields => [ $self->_fixed_fields ],
        variable_fields => \@attrs,
    };
}

sub flatten_to_name {
    my ( $self, $f ) = @_;
    my @namerec = (
        [ grep defined, @{$f->{attributes}{Name}}, @{$f->{attributes}{Alias}} ],
        $self->{track_label},
        $f->{attributes}{Name}[0],
        $f->{seq_id},
        (map $_+0, @{$f}{'start','end'}),
        $f->{attributes}{ID}[0],
        );
    $namerec[4]--; #< to one-based
    return \@namerec;
}
sub arrayReprClasses {
    my ( $self ) = @_;
    return [
        map {
            attributes  => [ map ucfirst, @{$_->{fields}}, 'Subfeatures' ],
            isArrayAttr => { Subfeatures => 1 }
        },
        sort { $a->{index} <=> $b->{index} }
        values %{ $self->{classes} }
    ];
}

sub startIndex        { 1 }
sub endIndex          { 2 }

1;
