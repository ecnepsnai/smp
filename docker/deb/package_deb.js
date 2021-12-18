const installer = require('electron-installer-debian')

const options = {
    src: '/build_root/package/Simple Media Player-linux-x64/',
    dest: '/build_root/package/artifacts/',
    arch: 'x86_64',
    icon: '/build_root/package/Simple Media Player-linux-x64/resources/app/dist/assets/SMP.png'
}

async function main(options) {
    console.log('Building .deb package...')

    try {
        await installer(options)
        console.log('Finished')
    } catch (err) {
        console.error(err, err.stack)
        process.exit(1)
    }
}
main(options)