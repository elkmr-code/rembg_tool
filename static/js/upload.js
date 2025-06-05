$(document).ready(function () {
    // 當拖放圖片到指定區域時
    $(".image-drop-area").on("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("box-shadow", "0 0 10px rgba(46, 204, 64, 0.7)");
        $(this).css("border-color", "rgb(46, 204, 64)");
        $(this).find(".fa-cloud-upload-alt").css("color", "rgb(46, 204, 64)");
    });

    // 當拖放圖片離開指定區域時
    $(".image-drop-area").on("dragleave", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("border-color", "#ccc");
        $(this).css("box-shadow", "0 0 10px transparent");
        $(this).find(".fa-cloud-upload-alt").css("color", "#888");
    });

    // 當放下圖片時
    $(".image-drop-area").on("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("border-color", "#ccc");
        $(this).css("box-shadow", "0 0 10px transparent");
        $(this).find(".fa-cloud-upload-alt").css("color", "#888");

        var files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            var file = files[0];
            onFileUpload(file);
        }
    });

    $(".image-drop-area").on("click", function () {
        $('<input type="file" accept="image/*">').on("change", function (e) {
            onFileUpload(e.target.files[0]);
        }).click();
    });

    $(".sample").on("click", function () {
        const sampleName = $(this).attr("sample") || "dog";
        const sampleFile = `static/img/sample-${sampleName}.jpg`;

        fetch(sampleFile)
            .then((response) => response.blob())
            .then((blob) => {
                const file = new File([blob], `${sampleName}.png`, {
                    type: "image/jpeg",
                });
                onFileUpload(file);
            })
            .catch((error) => {
                console.error("Error loading sample image:", error);
                alert("無法載入範例圖片，請稍後再試。");
            });
    });

    function onFileUpload(file) {
        const allowedTypes = ["image/jpeg", "image/png", "image/webp"];

        if (file && allowedTypes.includes(file.type)) {
            if (file.type === "image/webp") {
                // 如果是 WebP 圖片，則轉換為 PNG
                const reader = new FileReader();
                reader.onload = function (e) {
                    const img = new Image();
                    img.onload = function () {
                        const canvas = document.createElement("canvas");
                        canvas.width = img.width;
                        canvas.height = img.height;
                        const ctx = canvas.getContext("2d");
                        ctx.drawImage(img, 0, 0);
                        canvas.toBlob(function (blob) {
                            onFileUpload(blob);
                        }, "image/png");
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
                return;
            }

            $(".image-after").animate({
                "z-index": "0",
                "opacity": "0",
            }, 150);
            $(".image-before img").attr("src", URL.createObjectURL(file));
            $(".label-before").hide();
            $(".label-after").hide();

            $(".upload-card").css({
                "pointer-events": "none",
                "opacity": "0.5",
            });

            $(".download-background-removed-image").css("visibility", "hidden");
            detectImageObjects(file);
            removeImageBackground(file);
        } else {
            alert("請上傳有效的圖片文件（JPEG、PNG 或 WebP）。");
        }
    }

    function detectImageObjects(imageFile) {
        var form = new FormData();
        form.append("file", imageFile, URL.createObjectURL(imageFile));

        var settings = {
            "url": "/detect",
            "method": "POST",
            "timeout": 0,
            "processData": false,
            "mimeType": "multipart/form-data",
            "contentType": false,
            "data": form,
            "xhrFields": {
                "responseType": "application/json",
            },
        };

        $.ajax(settings).done(
            function (response) {
                const emojiNames = [];
                response = JSON.parse(response);
                response.forEach((object) => {
                    emojiNames.push(object.name);
                })
                fireEmojis(...emojiNames);
            },
        ).fail(function (jqXHR, textStatus, errorThrown) {
            alert("請求失敗，請稍後再試。");
        }).always(function () {
        });
    }

    function removeImageBackground(imageFile) {
        const ic = ImageCompares.find((ic) =>
            ic.container == document.querySelector(".main-compare")
        );

        if (ic) {
            $(ic.container).addClass("placeholder-wave");
            ic.setDragable(false);
            ic.jumpToPosition({ clientX: 100000 });
        }
        var form = new FormData();
        form.append("file", imageFile, URL.createObjectURL(imageFile));

        var settings = {
            "url": "/remove",
            "method": "POST",
            "timeout": 0,
            "processData": false,
            "mimeType": "multipart/form-data",
            "contentType": false,
            "data": form,
            "xhrFields": {
                "responseType": "arraybuffer",
            },
        };

        $.ajax(settings).done(
            function (response) {
                // 使用 ArrayBuffer 創建 Blob
                var blob = new Blob([response], { type: "image/png" });
                var imageUrl = URL.createObjectURL(blob);
                $(".image-before img").attr(
                    "src",
                    URL.createObjectURL(imageFile),
                );
                $(".image-after").attr("src", imageUrl);
            },
        ).fail(function (jqXHR, textStatus, errorThrown) {
            alert("請求失敗，請稍後再試。");
        }).always(function () {
            if (ic) {
                ic.jumpToPosition({ clientX: 0 });
            }
            $(ic.container).removeClass("placeholder-wave");

            $(".upload-card").css({
                "pointer-events": "auto",
                "opacity": "1",
            });

            $(".image-after").animate({
                "opacity": "1",
                "z-index": "3", // 去背圖層在滑桿上方
            }, 20);

            $(".download-background-removed-image a").attr(
                "href",
                $(".image-after").attr("src"),
            );
            $(".download-background-removed-image").css(
                "visibility",
                "visible",
            );
        });
    }
});

function fireEmojis(...emojiNames) {
    const emojis = [];
    emojiNames.forEach(name => {
        if (OBJECT_EMOJIS.has(name)) {
            emojis.push(OBJECT_EMOJIS.get(name));
        }
    })
    
    for (let i = 1; i <= 10; i++) {
        emojis.forEach((emoji, index) => {
            console.log(`Firing emoji: ${emoji}`);
            
            const span = document.createElement("span");
            span.textContent = emoji;
            span.style.position = "fixed";
            span.style.left = `${Math.random() * 80 + 10}%`;
            span.style.bottom = "5px";
            span.style.fontSize = `${Math.random() * 20 + 20}px`;
            span.style.zIndex = "9999";
            
            span.style.opacity = "1";
            
            setTimeout(() => {
                document.body.appendChild(span);

                const height = -300 - Math.random() * 200; // 最高點高度（負值表示向上）
                const jitter = Math.random() * 100 - 50; // 水平方向隨機偏移
                const rotation = Math.random() * 720 - 360; // 隨機旋轉
                const duration = 1.5 + Math.random() * 1.0; // 1.5-2.5秒動畫
                
                span.style.transition = `transform ${duration}s ease-out, opacity ${duration * 0.8}s ease-in`;
                
                requestAnimationFrame(() => {
                    span.style.transform = `translateX(${jitter}px) translateY(${height}px) rotate(${rotation}deg)`;
                });
                
                setTimeout(() => {
                    span.style.opacity = "0";
                }, duration * 500);
                
                setTimeout(() => {
                    span.remove();
                }, duration * 1000);
                
            }, 50 + 100 * index * Math.sqrt(i));
        });
    }
}
