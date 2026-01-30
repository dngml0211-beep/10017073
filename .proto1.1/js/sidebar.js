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
            el.textContent = userInfo.name || '지훈';
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

    if (appId === 'bookclub') {
        // KRS 전용 항목 숨기기
        krsOnlyItems.forEach(el => { el.style.display = 'none'; });
        // 홈 링크를 home2.html로 변경
        if (homeLink) { homeLink.href = 'home2.html'; }
    } else {
        // 모든 항목 표시 (KRS 모드)
        krsOnlyItems.forEach(el => { el.style.display = ''; });
        // 홈 링크를 home.html로 변경
        if (homeLink) { homeLink.href = 'home.html'; }
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
            <div class="px-6 pt-10 pb-4 relative z-20">
                <button onclick="toggleAppMenu()" class="flex items-center gap-2 group" id="logo-btn">
                    <h1 class="font-jua text-2xl text-brand-primary tracking-tight">
                        웅진북클럽 <span class="text-gray-400 text-base" id="logo-krs-label">KRS</span>
                    </h1>
                    <i class="fa-solid fa-chevron-down text-gray-400 text-sm transition-transform duration-300" id="logo-arrow"></i>
                </button>
            </div>

            <!-- 앱 선택 메뉴 (드롭다운 - 오버레이) -->
            <div id="app-menu" class="hidden absolute left-0 right-0 top-[72px] bottom-[60px] z-10 px-4 py-2 bg-white/95 backdrop-blur-sm overflow-y-auto">
                <div class="bg-gradient-to-br from-gray-50 to-gray-100 rounded-2xl p-2 space-y-1">
                    <button onclick="selectApp('bookclub-krs')" class="app-item active w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all bg-white shadow-sm">
                        <div class="w-10 h-10 bg-gradient-to-br from-brand-primary to-brand-dark rounded-xl flex items-center justify-center text-white text-lg shadow-md">📖</div>
                        <div class="text-left flex-1">
                            <p class="font-jua text-sm text-gray-800">웅진북클럽 KRS</p>
                            <p class="text-[10px] text-gray-400">AI 독서 프로그램</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm" id="check-bookclub-krs"></i>
                    </button>
                    <button onclick="selectApp('bookclub')" class="app-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white">
                        <div class="w-10 h-10 bg-gradient-to-br from-brand-primary to-orange-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md">📚</div>
                        <div class="text-left flex-1">
                            <p class="font-jua text-sm text-gray-800">웅진북클럽</p>
                            <p class="text-[10px] text-gray-400">독서 · 학습</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-bookclub"></i>
                    </button>
                    <button onclick="selectApp('smart-thinkbig')" class="app-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white">
                        <div class="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-xl flex items-center justify-center text-white text-lg shadow-md">🧠</div>
                        <div class="text-left flex-1">
                            <p class="font-jua text-sm text-gray-800">스마트씽크빅</p>
                            <p class="text-[10px] text-gray-400">사고력 · 창의력</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-smart-thinkbig"></i>
                    </button>
                    <button onclick="selectApp('smartall')" class="app-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white">
                        <div class="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md">🎓</div>
                        <div class="text-left flex-1">
                            <p class="font-jua text-sm text-gray-800">스마트올</p>
                            <p class="text-[10px] text-gray-400">전과목 학습</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-smartall"></i>
                    </button>
                    <button onclick="selectApp('superpot')" class="app-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white">
                        <div class="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md">🎮</div>
                        <div class="text-left flex-1">
                            <p class="font-jua text-sm text-gray-800">슈퍼팟</p>
                            <p class="text-[10px] text-gray-400">게임 · 활동</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-superpot"></i>
                    </button>
                    <button onclick="selectApp('lingocity')" class="app-item w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all hover:bg-white">
                        <div class="w-10 h-10 bg-gradient-to-br from-green-400 to-teal-500 rounded-xl flex items-center justify-center text-white text-lg shadow-md">🌍</div>
                        <div class="text-left flex-1">
                            <p class="font-jua text-sm text-gray-800">링고시티</p>
                            <p class="text-[10px] text-gray-400">영어 학습</p>
                        </div>
                        <i class="fa-solid fa-check text-brand-primary text-sm hidden" id="check-lingocity"></i>
                    </button>
                </div>
            </div>

            <!-- 프로필 카드 -->
            <div id="profile-section" class="mx-6 mb-4 p-4 bg-gradient-to-br from-brand-bg to-yellow-200 rounded-2xl flex items-center gap-3 shadow-sm transition-all duration-300">
                <div class="w-12 h-12 rounded-full bg-gradient-to-br from-orange-300 to-brand-primary flex items-center justify-center text-2xl border-2 border-white shadow-md">🐿️</div>
                <div>
                    <p class="font-jua text-lg text-gray-800" data-user-name>지훈</p>
                    <p class="text-xs text-gray-500">독서 탐험가</p>
                </div>
            </div>

            <!-- 네비게이션 -->
            <nav id="nav-section" class="flex-1 px-4 space-y-1 transition-all duration-300">
                <a href="home.html" data-page="home" id="nav-home-link" class="nav-link flex items-center gap-4 px-6 py-4 rounded-2xl transition-all text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-house text-xl w-6 text-center"></i>
                    <span class="font-jua text-lg">홈</span>
                </a>
                <a href="library.html" data-page="library" data-krs-only class="nav-link flex items-center gap-4 px-6 py-4 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-book-open text-xl w-6 text-center"></i>
                    <span class="font-jua text-lg">KRS 리딩트리</span>
                </a>
                <a href="book-library.html" data-page="book-library" class="nav-link flex items-center gap-4 px-6 py-4 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-layer-group text-xl w-6 text-center"></i>
                    <span class="font-jua text-lg">라이브러리</span>
                </a>
                <a href="report.html" data-page="report" class="nav-link flex items-center gap-4 px-6 py-4 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-chart-pie text-xl w-6 text-center"></i>
                    <span class="font-jua text-lg">리포트</span>
                </a>
                <a href="mypage.html" data-page="mypage" class="nav-link flex items-center gap-4 px-6 py-4 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-user text-xl w-6 text-center"></i>
                    <span class="font-jua text-lg">마이페이지</span>
                </a>
                <a href="starshop.html" data-page="starshop" class="nav-link flex items-center gap-4 px-6 py-4 rounded-2xl transition-colors text-gray-500 hover:bg-orange-50 hover:text-brand-primary">
                    <i class="fa-solid fa-star text-xl w-6 text-center"></i>
                    <span class="font-jua text-lg">스타샵</span>
                </a>

                <!-- KRS 전용: AI 버디 -->
                <div data-krs-only>
                    <div class="pt-4 pb-2 px-2">
                        <p class="text-xs font-medium text-gray-400 tracking-wide">AI 버디</p>
                    </div>
                    <a href="ai-buddy.html" data-page="ai-buddy" class="w-full flex items-center gap-3 px-5 py-3 rounded-2xl transition-all hover:bg-gradient-to-r hover:from-violet-50 hover:to-purple-50 group" style="text-decoration:none;">
                        <div class="relative w-10 h-10 rounded-full bg-gradient-to-br from-violet-400 to-purple-500 flex items-center justify-center text-xl shadow-md">
                            🐿️
                            <div class="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white"></div>
                        </div>
                        <div class="flex-1 text-left">
                            <p class="font-jua text-sm text-gray-700">다람이</p>
                            <div class="relative mt-0.5">
                                <div class="bg-gray-100 rounded-lg px-2.5 py-1">
                                    <p style="font-size:10px;" class="text-gray-400 truncate">안녕, 나랑 같이 이야기하자!</p>
                                </div>
                            </div>
                        </div>
                    </a>
                </div>
            </nav>
            <div class="p-6 relative z-20 bg-white">
                <div class="flex items-center justify-between text-gray-400 mb-2 px-2">
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

}

/**
 * 폴백: 인라인 로그아웃 모달 (fetch 실패 시)
 */
function loadInlineLogoutModal(container) {
    container.innerHTML = `
        <div id="logout-modal" class="hidden fixed inset-0 z-[10000] items-center justify-center">
            <div class="absolute inset-0 bg-black/50 backdrop-blur-sm" onclick="hideLogoutModal()"></div>
            <div class="relative bg-white rounded-3xl p-8 shadow-2xl max-w-sm w-full mx-4">
                <h3 class="font-jua text-xl text-center text-gray-800 mb-4">로그아웃 하시겠어요?</h3>
                <div class="flex gap-3">
                    <button onclick="hideLogoutModal()" class="flex-1 py-3 rounded-xl bg-gray-100 text-gray-600 font-bold hover:bg-gray-200">취소</button>
                    <button onclick="performLogout()" class="flex-1 py-3 rounded-xl bg-brand-primary text-white font-bold hover:bg-orange-600">확인</button>
                </div>
            </div>
        </div>
    `;
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
