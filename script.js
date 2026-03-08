document.addEventListener('DOMContentLoaded', function() {
    const isMobile = window.innerWidth < 768;

    const pageFlip = new St.PageFlip(document.getElementById('myBook'), {
        width: 450, // กว้างหน้าเดียว
        height: 600, // สูง
        size: "stretch",
        showCover: true,
        mode: isMobile ? "portrait" : "double", // สลับโหมดอัตโนมัติ
        mobileScrollSupport: false,
        maxShadowOpacity: 0.2
    });

    pageFlip.loadFromHTML(document.querySelectorAll('.page'));

    const currPageElem = document.getElementById('currPage');
    const totalPageElem = document.getElementById('totalPage');
    totalPageElem.innerText = pageFlip.getPageCount();

    pageFlip.on('flip', (e) => {
        currPageElem.innerText = e.data + 1;
    });

    document.getElementById('prevBtn').addEventListener('click', () => pageFlip.flipPrev());
    document.getElementById('nextBtn').addEventListener('click', () => pageFlip.flipNext());
});