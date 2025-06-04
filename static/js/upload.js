$(document).ready(function () {
    // 當拖放圖片到指定區域時
    $(".image-drop-area").on("dragover", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("box-shadow", "0 0 10px rgba(46, 204, 64, 0.7)");
        $(this).css("border-color", "rgb(46, 204, 64)");
    });

    // 當拖放圖片離開指定區域時
    $(".image-drop-area").on("dragleave", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("border-color", "#ccc");
        $(this).css("box-shadow", "0 0 10px transparent");
    });

    // 當放下圖片時
    $(".image-drop-area").on("drop", function (e) {
        e.preventDefault();
        e.stopPropagation();
        $(this).css("border-color", "#ccc");
        $(this).css("box-shadow", "0 0 10px transparent");

        var files = e.originalEvent.dataTransfer.files;
        if (files.length > 0) {
            var file = files[0];
            if (file.type.startsWith("image/")) {
                $(".image-before img").attr("src", URL.createObjectURL(file));
                $(".label-before").hide();
                $(".label-after").hide();
                uploadImage(file);
            } else {
                alert("請上傳一張圖片。");
            }
        }
    });

    $(".image-drop-area").on("click", function () {
        $('<input type="file" accept="image/*">').on("change", function (e) {
            var file = e.target.files[0];
            if (file && file.type.startsWith("image/")) {
                $(".image-before img").attr("src", URL.createObjectURL(file));
                $(".label-before").hide();
                $(".label-after").hide();
                uploadImage(file);
            } else {
                alert("請上傳一張圖片文件。");
            }
        }).click();
    });


    function uploadImage(imageFile) {
        const ic = ImageCompares.find((ic) => ic.container == document.querySelector(".main-compare"));
        
        if (ic) {
            ic.setDragable(false);
            ic.jumpToPosition({clientX: 1000});
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
                "responseType": "arraybuffer"
            }
        };

        $.ajax(settings).done(
            function (response) {
                // 使用 ArrayBuffer 創建 Blob
                var blob = new Blob([response], {type: "image/png"});
                var imageUrl = URL.createObjectURL(blob);
                
                $(".image-before img").attr("src", URL.createObjectURL(imageFile));
                $(".image-after").attr("src", imageUrl);

                if (ic) {
                    ic.updatePosition(0);
                }
            }
        ).fail(function (jqXHR, textStatus, errorThrown) {
            alert("請求失敗，請稍後再試。");
        })
    };
});
