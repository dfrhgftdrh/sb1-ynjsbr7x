// Initialize Lucide icons
lucide.createIcons();

// Audio player
let currentAudio = null;

function playRingtone(url) {
    if (currentAudio) {
        currentAudio.pause();
        if (currentAudio.src === url) {
            currentAudio = null;
            return;
        }
    }
    
    currentAudio = new Audio(url);
    currentAudio.play();
}

// Download handlers
function downloadWallpaper(postId) {
    handleDownload(postId);
}

function downloadRingtone(postId) {
    handleDownload(postId);
}

function handleDownload(postId) {
    const data = new FormData();
    data.append('action', 'ringbuz_download');
    data.append('post_id', postId);
    data.append('nonce', ringbuzData.nonce);

    fetch(ringbuzData.ajaxurl, {
        method: 'POST',
        body: data
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && data.data.url) {
            const link = document.createElement('a');
            link.href = data.data.url;
            link.download = '';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } else {
            throw new Error('Download failed');
        }
    })
    .catch(error => {
        console.error('Download error:', error);
        alert('Error starting download. Please try again.');
    });
}

// Share functionality
function shareContent(title, url) {
    if (navigator.share) {
        navigator.share({
            title: title,
            url: url
        })
        .catch(error => {
            if (error.name !== 'AbortError') {
                console.error('Share error:', error);
            }
        });
    } else {
        // Fallback to copy to clipboard
        navigator.clipboard.writeText(url)
            .then(() => alert('Link copied to clipboard!'))
            .catch(() => alert('Unable to copy link'));
    }
}

// Mobile menu
document.addEventListener('DOMContentLoaded', function() {
    const menuButton = document.querySelector('[aria-label="Menu"]');
    const mobileMenu = document.querySelector('.mobile-menu');
    
    if (menuButton && mobileMenu) {
        menuButton.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
    }
});