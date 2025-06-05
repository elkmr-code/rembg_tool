// Image comparison slider logic
document.addEventListener('DOMContentLoaded', () => {
    const container = document.querySelector('.image-container');
    const slider = document.querySelector('.slider');
    const before = document.querySelector('.image-before');
    let isDragging = false;

    if (container && slider && before) {
        const moveSlider = (x) => {
            const rect = container.getBoundingClientRect();
            let offset = x - rect.left;
            offset = Math.max(0, Math.min(offset, rect.width));
            const percent = (offset / rect.width) * 100;
            slider.style.left = `${percent}%`;
            before.style.clipPath = `inset(0 ${100 - percent}% 0 0)`;
        };

        const onDrag = (e) => {
            if (!isDragging) return;
            let x = e.touches ? e.touches[0].clientX : e.clientX;
            moveSlider(x);
        };

        slider.addEventListener('mousedown', (e) => {
            isDragging = true;
            document.body.style.userSelect = 'none';
        });
        slider.addEventListener('touchstart', (e) => {
            isDragging = true;
        });

        window.addEventListener('mousemove', onDrag);
        window.addEventListener('touchmove', onDrag);

        window.addEventListener('mouseup', () => {
            isDragging = false;
            document.body.style.userSelect = '';
        });
        window.addEventListener('touchend', () => {
            isDragging = false;
        });

        // Allow clicking anywhere on the container to move the slider
        container.addEventListener('click', (e) => {
            let x = e.touches ? e.touches[0].clientX : e.clientX;
            moveSlider(x);
        });
    }

    // Upload and sample logic
    const fileInput = document.getElementById('file-upload');
    const beforeImg = document.querySelector('.image-before img');
    const afterImg = document.querySelector('.image-after');
    const sampleThumbs = document.querySelectorAll('.sample-thumbs img');

    if (fileInput && beforeImg && afterImg) {
        fileInput.addEventListener('change', (e) => {
            const file = e.target.files[0];
            if (!file) return;
            const reader = new FileReader();
            reader.onload = (ev) => {
                beforeImg.src = ev.target.result;
                // For demo, just use the same image for after
                afterImg.src = ev.target.result;
            };
            reader.readAsDataURL(file);
        });
    }

    // Sample image click
    sampleThumbs.forEach(img => {
        img.addEventListener('click', () => {
            beforeImg.src = img.src;
            afterImg.src = img.src;
        });
    });

    // Paste image support
    document.addEventListener('paste', (e) => {
        const items = e.clipboardData.items;
        for (let item of items) {
            if (item.type.indexOf('image') !== -1) {
                const file = item.getAsFile();
                const reader = new FileReader();
                reader.onload = (ev) => {
                    beforeImg.src = ev.target.result;
                    afterImg.src = ev.target.result;
                };
                reader.readAsDataURL(file);
                break;
            }
        }
    });
});
