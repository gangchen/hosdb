=head1 NAME

JBlibs - when included, sets JBrowse Perl module paths

=cut

package JBlibs;
BEGIN {
  $JBlibs::AUTHORITY = 'cpan:RBUELS';
}
{
  $JBlibs::VERSION = '1.4.1';
}

#find the jbrowse root dir
use File::Basename 'dirname';
use File::Spec::Functions qw( catfile catdir updir );
my $dir = dirname($INC{'JBlibs.pm'}) or die;
my $extlib;
for my $d ( $dir, catdir( $dir, updir() ), catdir( $dir, updir(), updir() )) {
    $extlib = catfile( $d, 'extlib' );
    last if -e $extlib;
}
if( -e $extlib ) {
    require lib;
    lib->import( 'extlib/lib/perl5' );
    require local::lib;
    local::lib->import( $extlib );
}

1;
