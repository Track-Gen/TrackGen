if ('serviceWorker' in navigator) {
    window.addEventListener('load', e => {
        navigator.serviceWorker.register('/service-worker.js')
            .then(r => {
                reg = r;

                console.log('Registered service worker');
            })
            .catch(err => {
                console.error('Could not register service worker:', err);
            });
    });
}
