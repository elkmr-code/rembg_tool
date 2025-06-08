class ImageCompare {
    constructor(container) {
        this.container = container;
        this.imageContainer = container.querySelector('.image-container');
        this.slider = container.querySelector('.slider');
        this.imageBefore = container.querySelector('.image-before');
        this.isDragging = false;
        this.currentPosition = 50; // 百分比
        this.dragable = true;

        this.init();
    }

    init() {
        this.addEventListeners();
        this.updatePosition(50); // 初始位置設定為中間
    }

    addEventListeners() {
        // 滑鼠事件
        this.slider.addEventListener('mousedown', this.startDrag.bind(this));
        document.addEventListener('mousemove', this.drag.bind(this));
        document.addEventListener('mouseup', this.endDrag.bind(this));

        // 觸控事件
        this.slider.addEventListener('touchstart', this.startDrag.bind(this), { passive: false });
        document.addEventListener('touchmove', this.drag.bind(this), { passive: false });
        document.addEventListener('touchend', this.endDrag.bind(this));

        // 點擊圖片直接跳到該位置
        this.imageContainer.addEventListener('click', function (e) {
            if (!this.dragable) return;
            this.jumpToPosition(e);
        }.bind(this));

        // 鍵盤控制
        document.addEventListener('keydown', this.handleKeyboard.bind(this));

        // 防止圖片拖拽
        this.imageContainer.addEventListener('dragstart', (e) => e.preventDefault());
    }

    startDrag(e) {
        e.preventDefault();
        this.isDragging = true;
        this.imageContainer.style.cursor = 'grabbing';
    }

    setDragable(value) {
        this.dragable = value;
        // this.imageContainer.style.pointerEvents = 'none';
        this.slider.querySelector(".slider-button").style.opacity = value ? '1' : '0';
    }

    drag(e) {
        if (!this.isDragging || !this.dragable) return;
        
        e.preventDefault();
        
        const clientX = e.type.includes('touch') ? e.touches[0].clientX : e.clientX;
        const rect = this.imageContainer.getBoundingClientRect();
        const position = ((clientX - rect.left) / rect.width) * 100;
        
        this.updatePosition(Math.max(0, Math.min(100, position)));
    }

    endDrag() {
        this.isDragging = false;
        this.imageContainer.style.cursor = 'grab';
    }

    jumpToPosition(e) {
        if (this.isDragging) return;

        const rect = this.imageContainer.getBoundingClientRect();
        const position = ((e.clientX - rect.left) / rect.width) * 100;
        
        this.animateToPosition(Math.max(0, Math.min(100, position)));
    }

    handleKeyboard(e) {
        if (e.target.tagName.toLowerCase() === 'input') return;

        switch(e.key) {
            case 'ArrowLeft':
                e.preventDefault();
                this.animateToPosition(Math.max(0, this.currentPosition - 5));
                break;
            case 'ArrowRight':
                e.preventDefault();
                this.animateToPosition(Math.min(100, this.currentPosition + 5));
                break;
            case ' ':
                e.preventDefault();
                this.animateToPosition(50);
                break;
        }
    }

    updatePosition(position) {
        this.currentPosition = position;
        
        // 更新滑塊位置
        this.slider.style.left = `${position}%`;
        
        // 更新遮罩
        this.imageBefore.style.clipPath = `inset(0 ${100 - position}% 0 0)`;
    }

    animateToPosition(targetPosition) {
        const startPosition = this.currentPosition;
        const difference = targetPosition - startPosition;
        const duration = 600;
        const startTime = performance.now();

        const animate = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // 使用緩動函數
            const easeOutCubic = 1 - Math.pow(1 - progress, 3);
            const currentPosition = startPosition + (difference * easeOutCubic);
            
            this.updatePosition(currentPosition);
            
            if (progress < 1) {
                requestAnimationFrame(animate);
            }
        };

        requestAnimationFrame(animate);
    }
}

var ImageCompares = new Array();

// 初始化
document.addEventListener('DOMContentLoaded', () => {
    const compareContainers = document.querySelectorAll('.image-compare');
    compareContainers.forEach(container => {
        ImageCompares.push(new ImageCompare(container));
    });

    // 添加使用說明
    console.log('圖片對比器使用說明：');
    console.log('• 拖拽中間的滑塊來比較圖片');
    console.log('• 點擊圖片任意位置快速跳轉');
    console.log('• 使用左右箭頭鍵微調位置');
    console.log('• 按空白鍵回到中間位置');
});

// 圖片載入錯誤處理
document.addEventListener('DOMContentLoaded', () => {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        img.addEventListener('error', () => {
            console.warn(`圖片載入失敗: ${img.src}`);
            // 可以在這裡設置預設圖片或顯示錯誤訊息
        });
    });
});