import { createContext, useContext, useState, useEffect } from "react";

/* ═══════════════════════════════════════════════════════════════════
   LANGUAGE CONTEXT — MathHive i18n
   Supports: English, Spanish, French, German, Chinese, Japanese,
             Portuguese, Hindi, Korean, Arabic
═══════════════════════════════════════════════════════════════════ */

export const LANGUAGES = [
  { code: "en", name: "English",    nativeName: "English",    flag: "🇺🇸", rtl: false },
  { code: "es", name: "Spanish",    nativeName: "Español",    flag: "🇪🇸", rtl: false },
  { code: "fr", name: "French",     nativeName: "Français",   flag: "🇫🇷", rtl: false },
  { code: "de", name: "German",     nativeName: "Deutsch",    flag: "🇩🇪", rtl: false },
  { code: "zh", name: "Chinese",    nativeName: "中文",        flag: "🇨🇳", rtl: false },
  { code: "ja", name: "Japanese",   nativeName: "日本語",      flag: "🇯🇵", rtl: false },
  { code: "pt", name: "Portuguese", nativeName: "Português",  flag: "🇧🇷", rtl: false },
  { code: "hi", name: "Hindi",      nativeName: "हिन्दी",      flag: "🇮🇳", rtl: false },
  { code: "ko", name: "Korean",     nativeName: "한국어",      flag: "🇰🇷", rtl: false },
  { code: "ar", name: "Arabic",     nativeName: "العربية",    flag: "🇸🇦", rtl: true  },
];

const TRANSLATIONS = {
  en: {
    // Navigation
    nav_dashboard:  "Dashboard",
    nav_schedule:   "Schedule",
    nav_courses:    "Courses",
    nav_resources:  "Resources",
    nav_community:  "Community",
    nav_analytics:  "Analytics",
    nav_help:       "Help & Support",
    nav_settings:   "Settings",

    // Profile menu
    menu_my_profile:     "My Profile",
    menu_settings:       "Settings",
    menu_analytics:      "Analytics",
    menu_language:       "Language",
    menu_notifications:  "Notifications",
    menu_help_support:   "Help & Support",
    menu_log_out:        "Log Out",

    // Auth
    auth_welcome_back:     "Welcome Back",
    auth_join_the_game:    "Join the Game",
    auth_sign_in:          "Sign In",
    auth_sign_up:          "Sign Up",
    auth_username:         "Username",
    auth_email:            "Email",
    auth_password:         "Password",
    auth_no_account:       "Don't have an account?",
    auth_have_account:     "Already have an account?",
    auth_continue_guest:   "Continue as Guest",

    // Common
    save:    "Save",
    cancel:  "Cancel",
    close:   "Close",
    done:    "Done",
    back:    "Back",
    submit:  "Submit",
    loading: "Loading…",

    // Subjects
    subject_math:             "Math",
    subject_reading:          "Reading",
    subject_history:          "History",
    subject_computer_science: "Computer Science",
    subject_science:          "Science",

    // Community
    community_title:       "Community",
    community_host:        "Host a Study Session",
    community_join:        "Join a Session",
    community_no_sessions: "No sessions available",

    // Language modal
    lang_modal_title:  "Choose Language",
    lang_modal_subtitle: "Select your preferred language",
    lang_select:       "Select",

    // Dashboard
    dashboard_welcome:   "Welcome back",
    dashboard_streak:    "Day Streak",
    dashboard_total_xp:  "Total XP",
    dashboard_level:     "Level",
  },

  es: {
    nav_dashboard:  "Panel",
    nav_schedule:   "Horario",
    nav_courses:    "Cursos",
    nav_resources:  "Recursos",
    nav_community:  "Comunidad",
    nav_analytics:  "Analíticas",
    nav_help:       "Ayuda y Soporte",
    nav_settings:   "Configuración",

    menu_my_profile:     "Mi Perfil",
    menu_settings:       "Configuración",
    menu_analytics:      "Analíticas",
    menu_language:       "Idioma",
    menu_notifications:  "Notificaciones",
    menu_help_support:   "Ayuda y Soporte",
    menu_log_out:        "Cerrar Sesión",

    auth_welcome_back:   "Bienvenido de Nuevo",
    auth_join_the_game:  "Únete al Juego",
    auth_sign_in:        "Iniciar Sesión",
    auth_sign_up:        "Registrarse",
    auth_username:       "Nombre de Usuario",
    auth_email:          "Correo Electrónico",
    auth_password:       "Contraseña",
    auth_no_account:     "¿No tienes cuenta?",
    auth_have_account:   "¿Ya tienes cuenta?",
    auth_continue_guest: "Continuar como Invitado",

    save:    "Guardar",
    cancel:  "Cancelar",
    close:   "Cerrar",
    done:    "Listo",
    back:    "Atrás",
    submit:  "Enviar",
    loading: "Cargando…",

    subject_math:             "Matemáticas",
    subject_reading:          "Lectura",
    subject_history:          "Historia",
    subject_computer_science: "Ciencias de la Computación",
    subject_science:          "Ciencias",

    community_title:       "Comunidad",
    community_host:        "Organizar una Sesión",
    community_join:        "Unirse a una Sesión",
    community_no_sessions: "No hay sesiones disponibles",

    lang_modal_title:    "Elegir Idioma",
    lang_modal_subtitle: "Selecciona tu idioma preferido",
    lang_select:         "Seleccionar",

    dashboard_welcome:  "Bienvenido de vuelta",
    dashboard_streak:   "Racha de Días",
    dashboard_total_xp: "XP Total",
    dashboard_level:    "Nivel",
  },

  fr: {
    nav_dashboard:  "Tableau de Bord",
    nav_schedule:   "Emploi du Temps",
    nav_courses:    "Cours",
    nav_resources:  "Ressources",
    nav_community:  "Communauté",
    nav_analytics:  "Analytiques",
    nav_help:       "Aide et Support",
    nav_settings:   "Paramètres",

    menu_my_profile:     "Mon Profil",
    menu_settings:       "Paramètres",
    menu_analytics:      "Analytiques",
    menu_language:       "Langue",
    menu_notifications:  "Notifications",
    menu_help_support:   "Aide et Support",
    menu_log_out:        "Se Déconnecter",

    auth_welcome_back:   "Bon Retour",
    auth_join_the_game:  "Rejoindre le Jeu",
    auth_sign_in:        "Se Connecter",
    auth_sign_up:        "S'inscrire",
    auth_username:       "Nom d'Utilisateur",
    auth_email:          "E-mail",
    auth_password:       "Mot de Passe",
    auth_no_account:     "Pas de compte ?",
    auth_have_account:   "Déjà un compte ?",
    auth_continue_guest: "Continuer en Invité",

    save:    "Enregistrer",
    cancel:  "Annuler",
    close:   "Fermer",
    done:    "Terminé",
    back:    "Retour",
    submit:  "Soumettre",
    loading: "Chargement…",

    subject_math:             "Mathématiques",
    subject_reading:          "Lecture",
    subject_history:          "Histoire",
    subject_computer_science: "Informatique",
    subject_science:          "Sciences",

    community_title:       "Communauté",
    community_host:        "Organiser une Session",
    community_join:        "Rejoindre une Session",
    community_no_sessions: "Aucune session disponible",

    lang_modal_title:    "Choisir la Langue",
    lang_modal_subtitle: "Sélectionnez votre langue préférée",
    lang_select:         "Sélectionner",

    dashboard_welcome:  "Bon retour",
    dashboard_streak:   "Jours Consécutifs",
    dashboard_total_xp: "XP Total",
    dashboard_level:    "Niveau",
  },

  de: {
    nav_dashboard:  "Dashboard",
    nav_schedule:   "Stundenplan",
    nav_courses:    "Kurse",
    nav_resources:  "Ressourcen",
    nav_community:  "Community",
    nav_analytics:  "Analysen",
    nav_help:       "Hilfe & Support",
    nav_settings:   "Einstellungen",

    menu_my_profile:     "Mein Profil",
    menu_settings:       "Einstellungen",
    menu_analytics:      "Analysen",
    menu_language:       "Sprache",
    menu_notifications:  "Benachrichtigungen",
    menu_help_support:   "Hilfe & Support",
    menu_log_out:        "Abmelden",

    auth_welcome_back:   "Willkommen Zurück",
    auth_join_the_game:  "Mitmachen",
    auth_sign_in:        "Anmelden",
    auth_sign_up:        "Registrieren",
    auth_username:       "Benutzername",
    auth_email:          "E-Mail",
    auth_password:       "Passwort",
    auth_no_account:     "Kein Konto?",
    auth_have_account:   "Bereits ein Konto?",
    auth_continue_guest: "Als Gast fortfahren",

    save:    "Speichern",
    cancel:  "Abbrechen",
    close:   "Schließen",
    done:    "Fertig",
    back:    "Zurück",
    submit:  "Absenden",
    loading: "Laden…",

    subject_math:             "Mathematik",
    subject_reading:          "Lesen",
    subject_history:          "Geschichte",
    subject_computer_science: "Informatik",
    subject_science:          "Wissenschaft",

    community_title:       "Community",
    community_host:        "Session Hosten",
    community_join:        "Session Beitreten",
    community_no_sessions: "Keine Sessions verfügbar",

    lang_modal_title:    "Sprache Wählen",
    lang_modal_subtitle: "Wähle deine bevorzugte Sprache",
    lang_select:         "Auswählen",

    dashboard_welcome:  "Willkommen zurück",
    dashboard_streak:   "Tage-Streak",
    dashboard_total_xp: "Gesamt XP",
    dashboard_level:    "Level",
  },

  zh: {
    nav_dashboard:  "仪表板",
    nav_schedule:   "日程表",
    nav_courses:    "课程",
    nav_resources:  "资源",
    nav_community:  "社区",
    nav_analytics:  "分析",
    nav_help:       "帮助与支持",
    nav_settings:   "设置",

    menu_my_profile:     "我的主页",
    menu_settings:       "设置",
    menu_analytics:      "分析",
    menu_language:       "语言",
    menu_notifications:  "通知",
    menu_help_support:   "帮助与支持",
    menu_log_out:        "退出登录",

    auth_welcome_back:   "欢迎回来",
    auth_join_the_game:  "加入游戏",
    auth_sign_in:        "登录",
    auth_sign_up:        "注册",
    auth_username:       "用户名",
    auth_email:          "电子邮件",
    auth_password:       "密码",
    auth_no_account:     "没有账户？",
    auth_have_account:   "已有账户？",
    auth_continue_guest: "以访客身份继续",

    save:    "保存",
    cancel:  "取消",
    close:   "关闭",
    done:    "完成",
    back:    "返回",
    submit:  "提交",
    loading: "加载中…",

    subject_math:             "数学",
    subject_reading:          "阅读",
    subject_history:          "历史",
    subject_computer_science: "计算机科学",
    subject_science:          "科学",

    community_title:       "社区",
    community_host:        "举办学习会话",
    community_join:        "加入会话",
    community_no_sessions: "暂无会话",

    lang_modal_title:    "选择语言",
    lang_modal_subtitle: "请选择您偏好的语言",
    lang_select:         "选择",

    dashboard_welcome:  "欢迎回来",
    dashboard_streak:   "连续天数",
    dashboard_total_xp: "总经验值",
    dashboard_level:    "等级",
  },

  ja: {
    nav_dashboard:  "ダッシュボード",
    nav_schedule:   "スケジュール",
    nav_courses:    "コース",
    nav_resources:  "リソース",
    nav_community:  "コミュニティ",
    nav_analytics:  "分析",
    nav_help:       "ヘルプとサポート",
    nav_settings:   "設定",

    menu_my_profile:     "マイプロフィール",
    menu_settings:       "設定",
    menu_analytics:      "分析",
    menu_language:       "言語",
    menu_notifications:  "通知",
    menu_help_support:   "ヘルプとサポート",
    menu_log_out:        "ログアウト",

    auth_welcome_back:   "おかえりなさい",
    auth_join_the_game:  "ゲームに参加",
    auth_sign_in:        "サインイン",
    auth_sign_up:        "サインアップ",
    auth_username:       "ユーザー名",
    auth_email:          "メールアドレス",
    auth_password:       "パスワード",
    auth_no_account:     "アカウントをお持ちでない方は？",
    auth_have_account:   "すでにアカウントをお持ちですか？",
    auth_continue_guest: "ゲストとして続ける",

    save:    "保存",
    cancel:  "キャンセル",
    close:   "閉じる",
    done:    "完了",
    back:    "戻る",
    submit:  "送信",
    loading: "読み込み中…",

    subject_math:             "数学",
    subject_reading:          "読書",
    subject_history:          "歴史",
    subject_computer_science: "コンピューターサイエンス",
    subject_science:          "理科",

    community_title:       "コミュニティ",
    community_host:        "学習セッションをホスト",
    community_join:        "セッションに参加",
    community_no_sessions: "利用可能なセッションなし",

    lang_modal_title:    "言語を選択",
    lang_modal_subtitle: "お好みの言語を選んでください",
    lang_select:         "選択",

    dashboard_welcome:  "おかえりなさい",
    dashboard_streak:   "連続日数",
    dashboard_total_xp: "合計XP",
    dashboard_level:    "レベル",
  },

  pt: {
    nav_dashboard:  "Painel",
    nav_schedule:   "Horário",
    nav_courses:    "Cursos",
    nav_resources:  "Recursos",
    nav_community:  "Comunidade",
    nav_analytics:  "Análises",
    nav_help:       "Ajuda e Suporte",
    nav_settings:   "Configurações",

    menu_my_profile:     "Meu Perfil",
    menu_settings:       "Configurações",
    menu_analytics:      "Análises",
    menu_language:       "Idioma",
    menu_notifications:  "Notificações",
    menu_help_support:   "Ajuda e Suporte",
    menu_log_out:        "Sair",

    auth_welcome_back:   "Bem-vindo de Volta",
    auth_join_the_game:  "Junte-se ao Jogo",
    auth_sign_in:        "Entrar",
    auth_sign_up:        "Cadastrar",
    auth_username:       "Nome de Usuário",
    auth_email:          "E-mail",
    auth_password:       "Senha",
    auth_no_account:     "Não tem conta?",
    auth_have_account:   "Já tem conta?",
    auth_continue_guest: "Continuar como Visitante",

    save:    "Salvar",
    cancel:  "Cancelar",
    close:   "Fechar",
    done:    "Pronto",
    back:    "Voltar",
    submit:  "Enviar",
    loading: "Carregando…",

    subject_math:             "Matemática",
    subject_reading:          "Leitura",
    subject_history:          "História",
    subject_computer_science: "Ciência da Computação",
    subject_science:          "Ciências",

    community_title:       "Comunidade",
    community_host:        "Organizar uma Sessão",
    community_join:        "Entrar em uma Sessão",
    community_no_sessions: "Nenhuma sessão disponível",

    lang_modal_title:    "Escolher Idioma",
    lang_modal_subtitle: "Selecione seu idioma preferido",
    lang_select:         "Selecionar",

    dashboard_welcome:  "Bem-vindo de volta",
    dashboard_streak:   "Dias Consecutivos",
    dashboard_total_xp: "XP Total",
    dashboard_level:    "Nível",
  },

  hi: {
    nav_dashboard:  "डैशबोर्ड",
    nav_schedule:   "अनुसूची",
    nav_courses:    "पाठ्यक्रम",
    nav_resources:  "संसाधन",
    nav_community:  "समुदाय",
    nav_analytics:  "विश्लेषण",
    nav_help:       "सहायता",
    nav_settings:   "सेटिंग्स",

    menu_my_profile:     "मेरी प्रोफ़ाइल",
    menu_settings:       "सेटिंग्स",
    menu_analytics:      "विश्लेषण",
    menu_language:       "भाषा",
    menu_notifications:  "सूचनाएं",
    menu_help_support:   "सहायता",
    menu_log_out:        "लॉग आउट",

    auth_welcome_back:   "वापस स्वागत है",
    auth_join_the_game:  "खेल में शामिल हों",
    auth_sign_in:        "साइन इन करें",
    auth_sign_up:        "साइन अप करें",
    auth_username:       "उपयोगकर्ता नाम",
    auth_email:          "ईमेल",
    auth_password:       "पासवर्ड",
    auth_no_account:     "खाता नहीं है?",
    auth_have_account:   "पहले से खाता है?",
    auth_continue_guest: "अतिथि के रूप में जारी रखें",

    save:    "सहेजें",
    cancel:  "रद्द करें",
    close:   "बंद करें",
    done:    "हो गया",
    back:    "वापस",
    submit:  "जमा करें",
    loading: "लोड हो रहा है…",

    subject_math:             "गणित",
    subject_reading:          "पठन",
    subject_history:          "इतिहास",
    subject_computer_science: "कंप्यूटर विज्ञान",
    subject_science:          "विज्ञान",

    community_title:       "समुदाय",
    community_host:        "अध्ययन सत्र होस्ट करें",
    community_join:        "सत्र में शामिल हों",
    community_no_sessions: "कोई सत्र उपलब्ध नहीं",

    lang_modal_title:    "भाषा चुनें",
    lang_modal_subtitle: "अपनी पसंदीदा भाषा चुनें",
    lang_select:         "चुनें",

    dashboard_welcome:  "वापस स्वागत है",
    dashboard_streak:   "दिन की लकीर",
    dashboard_total_xp: "कुल XP",
    dashboard_level:    "स्तर",
  },

  ko: {
    nav_dashboard:  "대시보드",
    nav_schedule:   "일정",
    nav_courses:    "강좌",
    nav_resources:  "자료",
    nav_community:  "커뮤니티",
    nav_analytics:  "분석",
    nav_help:       "도움말 및 지원",
    nav_settings:   "설정",

    menu_my_profile:     "내 프로필",
    menu_settings:       "설정",
    menu_analytics:      "분석",
    menu_language:       "언어",
    menu_notifications:  "알림",
    menu_help_support:   "도움말 및 지원",
    menu_log_out:        "로그아웃",

    auth_welcome_back:   "다시 오셨군요",
    auth_join_the_game:  "게임에 참여하기",
    auth_sign_in:        "로그인",
    auth_sign_up:        "회원가입",
    auth_username:       "사용자 이름",
    auth_email:          "이메일",
    auth_password:       "비밀번호",
    auth_no_account:     "계정이 없으신가요?",
    auth_have_account:   "이미 계정이 있으신가요?",
    auth_continue_guest: "게스트로 계속하기",

    save:    "저장",
    cancel:  "취소",
    close:   "닫기",
    done:    "완료",
    back:    "뒤로",
    submit:  "제출",
    loading: "로딩 중…",

    subject_math:             "수학",
    subject_reading:          "읽기",
    subject_history:          "역사",
    subject_computer_science: "컴퓨터 과학",
    subject_science:          "과학",

    community_title:       "커뮤니티",
    community_host:        "학습 세션 호스팅",
    community_join:        "세션 참여",
    community_no_sessions: "이용 가능한 세션 없음",

    lang_modal_title:    "언어 선택",
    lang_modal_subtitle: "선호하는 언어를 선택하세요",
    lang_select:         "선택",

    dashboard_welcome:  "다시 오셨군요",
    dashboard_streak:   "연속 일수",
    dashboard_total_xp: "총 XP",
    dashboard_level:    "레벨",
  },

  ar: {
    nav_dashboard:  "لوحة التحكم",
    nav_schedule:   "الجدول الزمني",
    nav_courses:    "الدورات",
    nav_resources:  "الموارد",
    nav_community:  "المجتمع",
    nav_analytics:  "التحليلات",
    nav_help:       "المساعدة والدعم",
    nav_settings:   "الإعدادات",

    menu_my_profile:     "ملفي الشخصي",
    menu_settings:       "الإعدادات",
    menu_analytics:      "التحليلات",
    menu_language:       "اللغة",
    menu_notifications:  "الإشعارات",
    menu_help_support:   "المساعدة والدعم",
    menu_log_out:        "تسجيل الخروج",

    auth_welcome_back:   "مرحباً بعودتك",
    auth_join_the_game:  "انضم إلى اللعبة",
    auth_sign_in:        "تسجيل الدخول",
    auth_sign_up:        "إنشاء حساب",
    auth_username:       "اسم المستخدم",
    auth_email:          "البريد الإلكتروني",
    auth_password:       "كلمة المرور",
    auth_no_account:     "ليس لديك حساب؟",
    auth_have_account:   "لديك حساب بالفعل؟",
    auth_continue_guest: "المتابعة كضيف",

    save:    "حفظ",
    cancel:  "إلغاء",
    close:   "إغلاق",
    done:    "تم",
    back:    "رجوع",
    submit:  "إرسال",
    loading: "جار التحميل…",

    subject_math:             "الرياضيات",
    subject_reading:          "القراءة",
    subject_history:          "التاريخ",
    subject_computer_science: "علوم الحاسوب",
    subject_science:          "العلوم",

    community_title:       "المجتمع",
    community_host:        "استضافة جلسة دراسة",
    community_join:        "الانضمام إلى جلسة",
    community_no_sessions: "لا توجد جلسات متاحة",

    lang_modal_title:    "اختر اللغة",
    lang_modal_subtitle: "اختر لغتك المفضلة",
    lang_select:         "اختر",

    dashboard_welcome:  "مرحباً بعودتك",
    dashboard_streak:   "أيام متتالية",
    dashboard_total_xp: "مجموع XP",
    dashboard_level:    "المستوى",
  },
};

/* ═══════════════════════════════════════════════════════════════════
   CONTEXT & PROVIDER
═══════════════════════════════════════════════════════════════════ */

const LanguageContext = createContext(null);

export function LanguageProvider({ children }) {
  const [langCode, setLangCode] = useState(() => {
    return localStorage.getItem("studylink_lang") || "en";
  });

  useEffect(() => {
    localStorage.setItem("studylink_lang", langCode);
    const lang = LANGUAGES.find((l) => l.code === langCode);
    document.documentElement.setAttribute("dir", lang?.rtl ? "rtl" : "ltr");
    document.documentElement.setAttribute("lang", langCode);
  }, [langCode]);

  /** Translate a key, falling back to English if not found */
  const t = (key) => {
    const dict = TRANSLATIONS[langCode] || TRANSLATIONS.en;
    return dict[key] ?? TRANSLATIONS.en[key] ?? key;
  };

  const currentLang = LANGUAGES.find((l) => l.code === langCode) || LANGUAGES[0];

  return (
    <LanguageContext.Provider value={{ langCode, setLangCode, t, currentLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used within LanguageProvider");
  return ctx;
}
