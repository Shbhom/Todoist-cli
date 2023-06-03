pkgname=todoist-cli
pkgver=1.0.0
pkgrel=1
pkgdesc="CLI app for managing tasks"
arch=('any')
url="https://github.com/shbhom/todoist-cli"
license=('MIT')
depends=('nodejs')

source=("https://github.com/shbhom/todoist-cli/archive/v${pkgver}.tar.gz")
sha256sums=('...')

build() {
    cd "$srcdir/todoist-cli-$pkgver"
    npm install
}

package() {
    cd "$srcdir/todoist-cli-$pkgver"
    npm link
    install -Dm755 bin/todoist "$pkgdir/usr/bin/todoist"
}
