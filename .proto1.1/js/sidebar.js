/* ============================================
   북클럽 3.0 - 사이드바 JavaScript
   ============================================ */

/**
 * 사이드바 로드 및 초기화
 * @param {string} currentPage - 현재 페이지 이름 (예: 'home', 'library')
 */
async function loadSidebar(currentPage) {
    const container = document.getElementById('sidebar-container');
    if (!container) {
        console.warn('sidebar-container not found');
        return;
    }

    try {
        // 사이드바 HTML 로드
        const response = await fetch('../components/sidebar.html');
        if (!response.ok) throw new Error('Failed to load sidebar');

        const html = await response.text();
        container.innerHTML = html;

        // 현재 페이지 하이라이트
        highlightCurrentNav(currentPage);

        // 로그아웃 버튼 이벤트 바인딩
        bindLogoutButtons();

        // 사용자 정보 표시
        displayUserInfo();

        // 앱 선택 상태 복원
        const savedApp = sessionStorage.getItem('selectedApp') || 'bookclub-krs';
        applyAppNavVisibility(savedApp);
        restoreAppCheckIcons(savedApp);

        // 모바일 하단 네비게이션 렌더링
        renderBottomNav(currentPage);

        // AI 버디 플로팅 버튼 렌더링
        renderFloatingBuddy(currentPage);

    } catch (error) {
        console.error('Error loading sidebar:', error);
        // 폴백: 인라인 사이드바 사용
        loadInlineSidebar(container, currentPage);
    }
}

/**
 * 로그아웃 모달 로드
 */
async function loadLogoutModal() {
    const container = document.getElementById('logout-modal-container');
    if (!container) return;

    try {
        const response = await fetch('../components/logout-modal.html');
        if (!response.ok) throw new Error('Failed to load logout modal');

        const html = await response.text();
        container.innerHTML = html;

    } catch (error) {
        console.error('Error loading logout modal:', error);
        // 폴백: 인라인 모달 사용
        loadInlineLogoutModal(container);
    }
}

/**
 * 현재 페이지 네비게이션 하이라이트
 * @param {string} currentPage - 현재 페이지 이름
 */
function highlightCurrentNav(currentPage) {
    const navLinks = document.querySelectorAll('.nav-link, [data-page]');

    navLinks.forEach(link => {
        const page = link.getAttribute('data-page') || link.getAttribute('href')?.replace('.html', '');

        // 기존 스타일 제거
        link.classList.remove('bg-brand-primary', 'text-white', 'shadow-floating');
        link.classList.add('text-gray-500', 'hover:bg-orange-50', 'hover:text-brand-primary');

        // 현재 페이지 스타일 적용
        if (page === currentPage) {
            link.classList.remove('text-gray-500', 'hover:bg-orange-50', 'hover:text-brand-primary');
            link.classList.add('bg-brand-primary', 'text-white', 'shadow-floating', 'transform', 'hover:scale-[1.02]');
        }
    });
}

/**
 * 로그아웃 버튼 이벤트 바인딩
 */
function bindLogoutButtons() {
    const logoutBtns = document.querySelectorAll('[data-logout]');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', showLogoutModal);
    });
}

/**
 * 사용자 정보 표시
 */
function displayUserInfo() {
    if (typeof AppState !== 'undefined') {
        const userInfo = AppState.getUserInfo();

        const nameElements = document.querySelectorAll('[data-user-name]');
        nameElements.forEach(el => {
            el.textContent = userInfo.name || '우희';
        });
    }
}

/**
 * 모바일 사이드바 토글
 */
function toggleSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
        sidebar.classList.toggle('open');
    }
    if (overlay) {
        overlay.classList.toggle('active');
    }
}

/**
 * 모바일 사이드바 닫기
 */
function closeSidebar() {
    const sidebar = document.getElementById('main-sidebar');
    const overlay = document.getElementById('sidebar-overlay');

    if (sidebar) {
        sidebar.classList.remove('open');
    }
    if (overlay) {
        overlay.classList.remove('active');
    }
}

/**
 * 앱 메뉴 토글 (로고 클릭 시)
 */
let isAppMenuOpen = false;

function toggleAppMenu() {
    const appMenu = document.getElementById('app-menu');
    const logoArrow = document.getElementById('logo-arrow');

    isAppMenuOpen = !isAppMenuOpen;

    if (isAppMenuOpen) {
        // 앱 메뉴 열기 (오버레이 방식)
        appMenu.classList.remove('hidden');
        logoArrow.classList.add('rotate');
    } else {
        // 앱 메뉴 닫기
        appMenu.classList.add('hidden');
        logoArrow.classList.remove('rotate');
    }
}

/**
 * 앱 선택
 */
function selectApp(appId) {
    const apps = {
        'bookclub-krs': { name: '웅진북클럽 KRS', home: 'home.html' },
        bookclub:       { name: '웅진북클럽',     home: 'home2.html' },
        'smart-thinkbig': { name: '스마트씽크빅', home: null },
        smartall:       { name: '스마트올',       home: null },
        superpot:       { name: '슈퍼팟',         home: null },
        lingocity:      { name: '링고시티',       home: null }
    };

    // 체크 아이콘 업데이트
    restoreAppCheckIcons(appId);

    // 앱 상태 저장
    sessionStorage.setItem('selectedApp', appId);

    // 네비게이션 가시성 업데이트
    applyAppNavVisibility(appId);

    // 앱 이동 처리
    if (appId === 'bookclub-krs' || appId === 'bookclub') {
        const targetHome = apps[appId].home;
        const currentPage = window.location.pathname.split('/').pop();

        setTimeout(() => {
            toggleAppMenu();
            // 홈 페이지 간 전환이 필요한 경우 이동
            if (currentPage === 'home.html' || currentPage === 'home2.html') {
                if (currentPage !== targetHome) {
                    window.location.href = targetHome;
                }
            }
        }, 200);
    } else {
        // 다른 앱 - 알림 표시
        alert(apps[appId].name + ' 앱으로 이동합니다!');
        setTimeout(() => {
            toggleAppMenu();
        }, 200);
    }
}

/**
 * 앱 선택에 따른 네비게이션 가시성 적용
 */
function applyAppNavVisibility(appId) {
    const krsOnlyItems = document.querySelectorAll('[data-krs-only]');
    const homeLink = document.getElementById('nav-home-link');

    // 하단 네비 홈 링크도 함께 처리
    const bottomNavHome = document.querySelector('#bottom-nav .bottom-nav-item');

    if (appId === 'bookclub') {
        // KRS 전용 항목 숨기기
        krsOnlyItems.forEach(el => { el.style.display = 'none'; });
        // 홈 링크를 home2.html로 변경
        if (homeLink) { homeLink.href = 'home2.html'; }
        if (bottomNavHome) { bottomNavHome.href = 'home2.html'; }
    } else {
        // 모든 항목 표시 (KRS 모드)
        krsOnlyItems.forEach(el => { el.style.display = ''; });
        // 홈 링크를 home.html로 변경
        if (homeLink) { homeLink.href = 'home.html'; }
        if (bottomNavHome) { bottomNavHome.href = 'home.html'; }
    }
}

/**
 * 앱 체크 아이콘 및 로고 라벨 복원
 */
function restoreAppCheckIcons(appId) {
    ['bookclub-krs', 'bookclub', 'smart-thinkbig', 'smartall', 'superpot', 'lingocity'].forEach(id => {
        const check = document.getElementById('check-' + id);
        const item = check?.closest('.app-item');
        if (check) {
            if (id === appId) {
                check.classList.remove('hidden');
                item?.classList.add('active');
            } else {
                check.classList.add('hidden');
                item?.classList.remove('active');
            }
        }
    });

    // 로고 KRS 라벨 업데이트
    const krsLabel = document.getElementById('logo-krs-label');
    if (krsLabel) {
        krsLabel.textContent = (appId === 'bookclub-krs') ? 'KRS' : '';
    }
}

/**
 * 폴백: 인라인 사이드바 (fetch 실패 시)
 */
function loadInlineSidebar(container, currentPage) {
    container.innerHTML = `
        <aside class="sidebar" id="main-sidebar">
            <!-- 로고 (드롭다운 트리거) -->
            <div class="px-3 pt-3 pb-3 relative z-20">
                <button onclick="toggleAppMenu()" class="flex items-center gap-2 group" id="logo-btn">
                    <h1 class="font-noto text-[19px] font-bold text-brand-primary tracking-tight">
                        웅진북클럽 <span class="text-gray-400 text-[11px] font-bold" id="logo-krs-label">KRS</span>
                    </h1>
                    <i class="fa-solid fa-chevron-down text-gray-400 text-sm transition-transform duration-300" id="logo-arrow"></i>
                </button>
            </div>

            <!-- 앱 선택 메뉴 (드롭다운 - 오버레이) -->
            <div id="app-menu" class="hidden absolute left-0 right-0 top-[62px] bottom-[50px] z-10 px-2 py-2 bg-white/95 backdrop-blur-sm overflow-y-auto">
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-1.5 space-y-0.5">
                    <button onclick="selectApp('bookclub-krs')" class="app-item active w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all bg-white shadow-sm">
                        <div class="w-9 h-9 bg-gradient-to-br from-brand-primary to-brand-dark rounded-xl flex items-center justify-center text-white text-base shadow-md">📖</div>
                        <div class="text-left flex-1 min-w-0">
                            <p class="font-noto text-sm text-gray-800 truncate">웅진북클럽 KRS</p>
                            <p class="text-[10px] text-gray-400">AI 독서 프로그램</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm" id="check-bookclub-krs"></i>
                    </button>
                    <button onclick="selectApp('bookclub')" class="app-item w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all hover:bg-white">
                        <div class="w-9 h-9 bg-gradient-to-br from-brand-primary to-orange-500 rounded-xl flex items-center justify-center text-white text-base shadow-md">📚</div>
                        <div class="text-left flex-1 min-w-0">
                            <p class="font-noto text-sm text-gray-800 truncate">웅진북클럽</p>
                            <p class="text-[10px] text-gray-400">독서 · 학습</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-bookclub"></i>
                    </button>
                    <button onclick="selectApp('smart-thinkbig')" class="app-item w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all hover:bg-white">
                        <div class="w-9 h-9 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-base shadow-md">🧠</div>
                        <div class="text-left flex-1 min-w-0">
                            <p class="font-noto text-sm text-gray-800 truncate">스마트씽크빅</p>
                            <p class="text-[10px] text-gray-400">사고력 · 창의력</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-smart-thinkbig"></i>
                    </button>
                    <button onclick="selectApp('smartall')" class="app-item w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all hover:bg-white">
                        <div class="w-9 h-9 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-base shadow-md">🎓</div>
                        <div class="text-left flex-1 min-w-0">
                            <p class="font-noto text-sm text-gray-800 truncate">스마트올</p>
                            <p class="text-[10px] text-gray-400">전과목 학습</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-smartall"></i>
                    </button>
                    <button onclick="selectApp('superpot')" class="app-item w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all hover:bg-white">
                        <div class="w-9 h-9 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-base shadow-md">🎮</div>
                        <div class="text-left flex-1 min-w-0">
                            <p class="font-noto text-sm text-gray-800 truncate">슈퍼팟</p>
                            <p class="text-[10px] text-gray-400">게임 · 활동</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-superpot"></i>
                    </button>
                    <button onclick="selectApp('lingocity')" class="app-item w-full flex items-center gap-2.5 px-2.5 py-2.5 rounded-xl transition-all hover:bg-white">
                        <div class="w-9 h-9 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-base shadow-md">🌍</div>
                        <div class="text-left flex-1 min-w-0">
                            <p class="font-noto text-sm text-gray-800 truncate">링고시티</p>
                            <p class="text-[10px] text-gray-400">영어 학습</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-lingocity"></i>
                    </button>
                </div>
            </div>

            <!-- 프로필 카드 -->
            <div id="profile-section" class="mx-3 mb-4 p-3 bg-gradient-to-br from-brand-bg to-yellow-200 rounded-2xl flex items-center gap-3 shadow-sm transition-all duration-300">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-brand-primary flex items-center justify-center text-2xl border-2 border-white shadow-md">🔥</div>
                <div>
                    <p class="font-noto text-[13px] text-gray-800" data-user-name>우희</p>
                    <p class="text-xs text-gray-500">독서 탐험가</p>
                </div>
            </div>

            <!-- 네비게이션 -->
            <nav id="nav-section" class="flex-1 px-2 space-y-1 transition-all duration-300">
                <a href="home.html" data-page="home" id="nav-home-link" class="nav-link flex items-center gap-3 px-3 py-3 rounded-2xl transition-all text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-house text-xl w-6 text-center"></i>
                    <span class="font-noto text-lg">홈</span>
                </a>
                <a href="library.html" data-page="library" data-krs-only class="nav-link flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-book-open text-xl w-6 text-center"></i>
                    <span class="font-noto text-lg">KRS 도서관</span>
                </a>
                <a href="book-library.html" data-page="book-library" class="nav-link flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-layer-group text-xl w-6 text-center"></i>
                    <span class="font-noto text-lg">라이브러리</span>
                </a>
                <a href="mypage.html" data-page="mypage" class="nav-link flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-user text-xl w-6 text-center"></i>
                    <span class="font-noto text-lg">마이페이지</span>
                </a>
                <a href="starshop.html" data-page="starshop" class="nav-link flex items-center gap-3 px-3 py-3 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-star text-xl w-6 text-center"></i>
                    <span class="font-noto text-lg">스타샵</span>
                </a>

                <!-- KRS 전용: AI 버디 -->
                <div data-krs-only>
                    <div class="pt-4 pb-2 px-2"></div>
                    <a href="ai-buddy.html" data-page="ai-buddy" class="w-full flex items-center gap-3 px-3 py-3 rounded-2xl transition-all hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 group" style="text-decoration:none;">
                        <div class="relative w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xl shadow-md">
                            🐿️
                            <div class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div class="flex-1 text-left min-w-0">
                            <p class="font-noto text-sm text-gray-700">AI 버디</p>
                        </div>
                    </a>
                </div>
            </nav>
            <div class="p-4 relative z-20 bg-white">
                <div class="flex items-center justify-between text-gray-400 mb-2 px-1">
                    <button class="hover:text-brand-primary text-sm font-medium">
                        <i class="fa-solid fa-gear mr-2"></i>설정
                    </button>
                    <button data-logout class="hover:text-red-400 text-sm font-medium">
                        <i class="fa-solid fa-right-from-bracket mr-2"></i>로그아웃
                    </button>
                </div>
            </div>
        </aside>
        <style>
            #logo-arrow.rotate { transform: rotate(180deg); }
        </style>
    `;
    highlightCurrentNav(currentPage);
    bindLogoutButtons();

    // 앱 선택 상태 복원
    const savedApp = sessionStorage.getItem('selectedApp') || 'bookclub-krs';
    applyAppNavVisibility(savedApp);
    restoreAppCheckIcons(savedApp);

    // 모바일 하단 네비게이션 렌더링
    renderBottomNav(currentPage);

    // AI 버디 플로팅 버튼 렌더링
    renderFloatingBuddy(currentPage);
}

/**
 * 폴백: 인라인 로그아웃 모달 (fetch 실패 시)
 */
function loadInlineLogoutModal(container) {
    container.innerHTML = `
        <div id="logout-modal" class="hidden fixed inset-0 z-[10000] items-center justify-center">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="hideLogoutModal()"></div>
            <div class="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4">
                <h3 class="font-noto text-xl text-center text-gray-800 mb-4">로그아웃 하시겠어요?</h3>
                <div class="flex gap-3">
                    <button onclick="hideLogoutModal()" class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">취소</button>
                    <button onclick="performLogout()" class="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-orange-600">확인</button>
                </div>
            </div>
        </div>
    `;
}

/**
 * 모바일 하단 네비게이션 바 렌더링
 * @param {string} currentPage - 현재 페이지 이름
 */
function renderBottomNav(currentPage) {
    // 중복 생성 방지
    if (document.getElementById('bottom-nav')) return;

    const savedApp = sessionStorage.getItem('selectedApp') || 'bookclub-krs';
    const isKRS = (savedApp === 'bookclub-krs');
    const homeHref = isKRS ? 'home.html' : 'home2.html';

    const navItems = [
        { id: 'home', href: homeHref, icon: 'fa-solid fa-house', label: '홈' },
        { id: 'library', href: 'library.html', icon: 'fa-solid fa-book-open', label: '도서관', krsOnly: true },
        { id: 'book-library', href: 'book-library.html', icon: 'fa-solid fa-layer-group', label: '라이브러리' },
        { id: 'mypage', href: 'mypage.html', icon: 'fa-solid fa-user', label: '마이페이지' },
    ];

    const nav = document.createElement('nav');
    nav.id = 'bottom-nav';
    nav.className = 'bottom-nav';

    let inner = '<div class="bottom-nav-inner">';
    navItems.forEach(item => {
        const krsAttr = item.krsOnly ? ' data-krs-only' : '';
        const hiddenStyle = (item.krsOnly && !isKRS) ? ' style="display:none"' : '';
        const isActive = (item.id === currentPage) || (item.id === 'home' && currentPage === 'home2');
        const activeClass = isActive ? ' active' : '';

        const iconEl = '<i class="' + item.icon + '"></i>';

        inner += '<a href="' + item.href + '" class="bottom-nav-item' + activeClass + '"' + krsAttr + hiddenStyle + '>'
            + iconEl + '<span>' + item.label + '</span></a>';
    });
    inner += '</div>';
    nav.innerHTML = inner;

    document.body.appendChild(nav);
}

/**
 * AI 버디 플로팅 버튼 렌더링 (모바일 우측 하단)
 * @param {string} currentPage - 현재 페이지 이름
 */
function renderFloatingBuddy(currentPage) {
    // 중복 생성 방지
    if (document.getElementById('floating-buddy')) return;
    // AI 버디 페이지에서는 표시하지 않음
    if (currentPage === 'ai-buddy') return;

    const savedApp = sessionStorage.getItem('selectedApp') || 'bookclub-krs';
    const isKRS = (savedApp === 'bookclub-krs');

    const btn = document.createElement('a');
    btn.id = 'floating-buddy';
    btn.href = 'ai-buddy.html';
    btn.className = 'floating-buddy';
    btn.setAttribute('data-krs-only', '');
    if (!isKRS) btn.style.display = 'none';

    btn.innerHTML = '<span class="floating-buddy-emoji">🐿️</span>'
        + '<span class="floating-buddy-pulse"></span>';

    document.body.appendChild(btn);
}

// 전역으로 내보내기
window.loadSidebar = loadSidebar;
window.loadLogoutModal = loadLogoutModal;
window.highlightCurrentNav = highlightCurrentNav;
window.toggleSidebar = toggleSidebar;
window.closeSidebar = closeSidebar;
window.toggleAppMenu = toggleAppMenu;
window.selectApp = selectApp;
window.applyAppNavVisibility = applyAppNavVisibility;
window.restoreAppCheckIcons = restoreAppCheckIcons;
window.renderBottomNav = renderBottomNav;
window.renderFloatingBuddy = renderFloatingBuddy;
