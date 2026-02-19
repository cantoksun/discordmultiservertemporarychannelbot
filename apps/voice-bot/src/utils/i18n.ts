// Voice Bot i18n - Simplified translations for 8 languages

const translations = {
    en: {
        settings: {
            title: '⚙️ voice channel settings',
            description: 'configure your server\'s temporary voice channel system',
            join_channel: '🎤 join-to-create channel',
            category: '📁 category',
            max_channels: '🔢 max channels',
            cooldown: '⏱️ user cooldown',
            delete_delay: '🗑️ delete delay',
            status: '✅ status',
            language: '🌐 language',
            not_set: 'not set',
            enabled: 'enabled',
            disabled: 'disabled',
            footer: 'settings update in real-time'
        },
        options: {
            select_join: 'select join-to-create channel',
            select_category: 'select category for temp channels',
            configure: 'configure other settings',
            max_channels_label: 'set max channels',
            max_channels_desc: 'maximum number of temp channels (1-50)',
            cooldown_label: 'set user cooldown',
            cooldown_desc: 'cooldown between channel creations (0-3600s)',
            delete_delay_label: 'set delete delay',
            delete_delay_desc: 'delay before deleting empty channels (5-300s)',
            toggle_system_label: 'toggle system',
            toggle_system_desc: 'enable/disable the entire system'
        },
        buttons: {
            lock: 'lock',
            unlock: 'unlock',
            limit: 'limit',
            rename: 'rename',
            kick: 'kick',
            transfer: 'transfer',
            close: 'close',
            refresh: 'refresh'
        },
        embeds: {
            title: '🎙️ voice channel controls',
            description: 'your temporary voice channel has been created!',
            status: '🔒 status',
            limit: '👥 user limit',
            owner: '👑 owner',
            channel_name: '📝 channel name',
            locked: 'locked',
            unlocked: 'unlocked',
            no_limit: 'no limit',
            footer: 'use the buttons below to manage your channel'
        },
        modals: {
            limit_title: 'set user limit',
            limit_label: 'limit (0-99)',
            rename_title: 'rename channel',
            rename_label: 'new channel name',
            kick_title: 'kick user',
            kick_label: 'user id or username',
            kick_placeholder: 'enter user id or username to kick',
            transfer_title: 'transfer ownership',
            transfer_label: 'new owner id or username',
            transfer_placeholder: 'enter user id or username'
        },
        errors: {
            no_permission: '❌ you do not have permission.',
            not_owner: '❌ you are not the owner of this channel.',
            no_channel: '❌ channel not found.',
            not_in_voice: '❌ you must be in a voice channel.',
            invalid_limit: '❌ invalid limit (0-99)',
            invalid_name: '❌ invalid name',
            user_not_found: '❌ user not found',
            user_not_in_channel: '❌ user is not in your channel',
            owner_must_be_in_channel: '❌ new owner must be in the channel',
            rate_limit: '❌ rate limit exceeded. please wait.',
            bot_missing_perms: '❌ i do not have permission to manage this channel.'
        }
    },
    tr: {
        settings: {
            title: '⚙️ ses kanalı ayarları',
            description: 'sunucunuzun geçici ses kanalı sistemini yapılandırın',
            join_channel: '🎤 katılma kanalı',
            category: '📁 kategori',
            max_channels: '🔢 maks. kanal',
            cooldown: '⏱️ bekleme süresi',
            delete_delay: '🗑️ silme gecikmesi',
            status: '✅ durum',
            language: '🌐 dil',
            not_set: 'ayarlanmadı',
            enabled: 'aktif',
            disabled: 'devre dışı',
            footer: 'ayarlar anlık güncellenir'
        },
        options: {
            select_join: 'katılma kanalını seç',
            select_category: 'geçici kanallar için kategori seç',
            configure: 'diğer ayarları yapılandır',
            max_channels_label: 'maksimum kanal sayısı',
            max_channels_desc: 'maksimum geçici kanal sayısı (1-50)',
            cooldown_label: 'kullanıcı bekleme süresi',
            cooldown_desc: 'kanal oluşturma arasındaki bekleme (0-3600s)',
            delete_delay_label: 'silme gecikmesi',
            delete_delay_desc: 'boş kanalın silinme süresi (5-300s)',
            toggle_system_label: 'sistemi aç/kapat',
            toggle_system_desc: 'tüm sistemi etkinleştir/devre dışı bırak'
        },
        buttons: {
            lock: 'kilitle',
            unlock: 'kilit aç',
            limit: 'limit',
            rename: 'ad değiştir',
            kick: 'at',
            transfer: 'devret',
            close: 'kapat',
            refresh: 'yenile'
        },
        embeds: {
            title: '🎙️ ses kanalı kontrolleri',
            description: 'geçici ses kanalınız oluşturuldu!',
            status: '🔒 durum',
            limit: '👥 kullanıcı limiti',
            owner: '👑 sahip',
            channel_name: '📝 kanal adı',
            locked: 'kilitli',
            unlocked: 'açık',
            no_limit: 'limitsiz',
            footer: 'kanalınızı yönetmek için aşağıdaki butonları kullanın'
        },
        modals: {
            limit_title: 'kullanıcı limiti ayarla',
            limit_label: 'limit (0-99)',
            rename_title: 'kanal adını değiştir',
            rename_label: 'yeni kanal adı',
            kick_title: 'kullanıcıyı at',
            kick_label: 'kullanıcı id veya adı',
            kick_placeholder: 'atılacak kullanıcı id veya adı',
            transfer_title: 'sahipliği devret',
            transfer_label: 'yeni sahip id veya adı',
            transfer_placeholder: 'kullanıcı id veya adı'
        },
        errors: {
            no_permission: '❌ yetkiniz yok.',
            not_owner: '❌ bu kanalın sahibi değilsiniz.',
            no_channel: '❌ kanal bulunamadı.',
            not_in_voice: '❌ bir ses kanalında olmalısınız.',
            invalid_limit: '❌ geçersiz limit (0-99)',
            invalid_name: '❌ geçersiz isim',
            user_not_found: '❌ kullanıcı bulunamadı',
            user_not_in_channel: '❌ kullanıcı kanalınızda değil',
            owner_must_be_in_channel: '❌ yeni sahip kanalda olmalı',
            rate_limit: '❌ hız sınırı aşıldı. lütfen bekleyin.',
            bot_missing_perms: '❌ bu kanalı yönetme yetkim yok.'
        }
    },
    es: {
        settings: {
            title: '⚙️ configuración de canales de voz',
            description: 'configura el sistema de canales de voz temporales',
            join_channel: '🎤 canal de creación',
            category: '📁 categoría',
            max_channels: '🔢 canales máx.',
            cooldown: '⏱️ tiempo de espera',
            delete_delay: '🗑️ retraso de eliminación',
            status: '✅ estado',
            language: '🌐 idioma',
            not_set: 'no configurado',
            enabled: 'activado',
            disabled: 'desactivado',
            footer: 'los ajustes se actualizan en tiempo real'
        },
        options: {
            select_join: 'seleccionar canal de creación',
            select_category: 'seleccionar categoría para canales temporales',
            configure: 'configurar otros ajustes',
            max_channels_label: 'establecer canales máximos',
            max_channels_desc: 'número máximo de canales temporales (1-50)',
            cooldown_label: 'establecer tiempo de espera',
            cooldown_desc: 'tiempo entre creaciones de canales (0-3600s)',
            delete_delay_label: 'establecer retraso de eliminación',
            delete_delay_desc: 'retraso antes de eliminar canales vacíos (5-300s)',
            toggle_system_label: 'activar/desactivar sistema',
            toggle_system_desc: 'activar/desactivar todo el sistema'
        },
        buttons: {
            lock: 'bloquear',
            unlock: 'desbloquear',
            limit: 'límite',
            rename: 'renombrar',
            kick: 'expulsar',
            transfer: 'transferir',
            close: 'cerrar',
            refresh: 'actualizar'
        },
        embeds: {
            title: '🎙️ controles de canal de voz',
            description: '¡tu canal de voz temporal ha sido creado!',
            status: '🔒 estado',
            limit: '👥 límite de usuarios',
            owner: '👑 propietario',
            channel_name: '📝 nombre del canal',
            locked: 'bloqueado',
            unlocked: 'desbloqueado',
            no_limit: 'sin límite',
            footer: 'usa los botones de abajo para gestionar tu canal'
        },
        modals: {
            limit_title: 'establecer límite de usuarios',
            limit_label: 'límite (0-99)',
            rename_title: 'renombrar canal',
            rename_label: 'nuevo nombre del canal',
            kick_title: 'expulsar usuario',
            kick_label: 'id de usuario o nombre',
            kick_placeholder: 'ingresa id de usuario o nombre',
            transfer_title: 'transferir propiedad',
            transfer_label: 'id de nuevo propietario o nombre',
            transfer_placeholder: 'ingresa id de usuario o nombre'
        },
        errors: {
            no_permission: '❌ no tienes permiso.',
            not_owner: '❌ no eres el propietario de este canal.',
            no_channel: '❌ canal no encontrado.',
            not_in_voice: '❌ debes estar en un canal de voz.',
            invalid_limit: '❌ límite inválido (0-99)',
            invalid_name: '❌ nombre inválido',
            user_not_found: '❌ usuario no encontrado',
            user_not_in_channel: '❌ el usuario no está en tu canal',
            owner_must_be_in_channel: '❌ el nuevo propietario debe estar en el canal'
        }
    },
    fr: {
        settings: {
            title: '⚙️ paramètres des canaux vocaux',
            description: 'configurez le système de canaux vocaux temporaires',
            join_channel: '🎤 canal de création',
            category: '📁 catégorie',
            max_channels: '🔢 canaux max.',
            cooldown: '⏱️ temps d\'attente',
            delete_delay: '🗑️ délai de suppression',
            status: '✅ statut',
            language: '🌐 langue',
            not_set: 'non défini',
            enabled: 'activé',
            disabled: 'désactivé',
            footer: 'les paramètres se mettent à jour en temps réel'
        },
        options: {
            select_join: 'sélectionner le canal de création',
            select_category: 'sélectionner la catégorie pour les canaux temporaires',
            configure: 'configurer d\'autres paramètres',
            max_channels_label: 'définir le nombre maximum de canaux',
            max_channels_desc: 'nombre maximum de canaux temporaires (1-50)',
            cooldown_label: 'définir le temps d\'attente',
            cooldown_desc: 'temps entre les créations de canaux (0-3600s)',
            delete_delay_label: 'définir le délai de suppression',
            delete_delay_desc: 'délai avant la suppression des canaux vides (5-300s)',
            toggle_system_label: 'activer/désactiver le système',
            toggle_system_desc: 'activer/désactiver tout le système'
        },
        buttons: {
            lock: 'verrouiller',
            unlock: 'déverrouiller',
            limit: 'limite',
            rename: 'renommer',
            kick: 'expulser',
            transfer: 'transférer',
            close: 'fermer',
            refresh: 'actualiser'
        },
        embeds: {
            title: '🎙️ contrôles du canal vocal',
            description: 'votre canal vocal temporaire a été créé !',
            status: '🔒 statut',
            limit: '👥 limite d\'utilisateurs',
            owner: '👑 propriétaire',
            channel_name: '📝 nom du canal',
            locked: 'verrouillé',
            unlocked: 'déverrouillé',
            no_limit: 'pas de limite',
            footer: 'utilisez les boutons ci-dessous pour gérer votre canal'
        },
        modals: {
            limit_title: 'définir la limite d\'utilisateurs',
            limit_label: 'limite (0-99)',
            rename_title: 'renommer le canal',
            rename_label: 'nouveau nom du canal',
            kick_title: 'expulser un utilisateur',
            kick_label: 'id utilisateur ou nom',
            kick_placeholder: 'entrez l\'id utilisateur ou le nom',
            transfer_title: 'transférer la propriété',
            transfer_label: 'id nouveau propriétaire ou nom',
            transfer_placeholder: 'entrez l\'id utilisateur ou le nom'
        },
        errors: {
            no_permission: '❌ vous n\'avez pas la permission.',
            not_owner: '❌ vous n\'êtes pas le propriétaire de ce canal.',
            no_channel: '❌ canal non trouvé.',
            not_in_voice: '❌ vous devez être dans un canal vocal.',
            invalid_limit: '❌ limite invalide (0-99)',
            invalid_name: '❌ nom invalide',
            user_not_found: '❌ utilisateur non trouvé',
            user_not_in_channel: '❌ l\'utilisateur n\'est pas dans votre canal',
            owner_must_be_in_channel: '❌ le nouveau propriétaire doit être dans le canal'
        }
    },
    de: {
        settings: {
            title: '⚙️ sprachkanal-einstellungen',
            description: 'konfigurieren sie das temporäre sprachkanalsystem',
            join_channel: '🎤 erstellungskanal',
            category: '📁 kategorie',
            max_channels: '🔢 max. kanäle',
            cooldown: '⏱️ wartezeit',
            delete_delay: '🗑️ löschverzögerung',
            status: '✅ status',
            language: '🌐 sprache',
            not_set: 'nicht festgelegt',
            enabled: 'aktiviert',
            disabled: 'deaktiviert',
            footer: 'einstellungen werden in echtzeit aktualisiert'
        },
        options: {
            select_join: 'erstellungskanal auswählen',
            select_category: 'kategorie für temporäre kanäle auswählen',
            configure: 'weitere einstellungen konfigurieren',
            max_channels_label: 'maximale kanäle festlegen',
            max_channels_desc: 'maximale anzahl temporärer kanäle (1-50)',
            cooldown_label: 'wartezeit festlegen',
            cooldown_desc: 'zeit zwischen kanalerstellungen (0-3600s)',
            delete_delay_label: 'löschverzögerung festlegen',
            delete_delay_desc: 'verzögerung vor dem löschen leerer kanäle (5-300s)',
            toggle_system_label: 'system aktivieren/deaktivieren',
            toggle_system_desc: 'das gesamte system aktivieren/deaktivieren'
        },
        buttons: {
            lock: 'sperren',
            unlock: 'entsperren',
            limit: 'limit',
            rename: 'umbenennen',
            kick: 'kicken',
            transfer: 'übertragen',
            close: 'schließen',
            refresh: 'aktualisieren'
        },
        embeds: {
            title: '🎙️ sprachkanal-steuerung',
            description: 'ihr temporärer sprachkanal wurde erstellt!',
            status: '🔒 status',
            limit: '👥 benutzerlimit',
            owner: '👑 besitzer',
            channel_name: '📝 kanalname',
            locked: 'gesperrt',
            unlocked: 'entsperrt',
            no_limit: 'kein limit',
            footer: 'benutzen sie die buttons unten, um ihren kanal zu verwalten'
        },
        modals: {
            limit_title: 'benutzerlimit festlegen',
            limit_label: 'limit (0-99)',
            rename_title: 'kanal umbenennen',
            rename_label: 'neuer kanalname',
            kick_title: 'benutzer kicken',
            kick_label: 'benutzer-id oder name',
            kick_placeholder: 'benutzer-id oder name eingeben',
            transfer_title: 'besitz übertragen',
            transfer_label: 'neue besitzer-id oder name',
            transfer_placeholder: 'benutzer-id oder name eingeben'
        },
        errors: {
            no_permission: '❌ sie haben keine berechtigung.',
            not_owner: '❌ sie sind nicht der besitzer dieses kanals.',
            no_channel: '❌ kanal nicht gefunden.',
            not_in_voice: '❌ sie müssen in einem sprachkanal sein.',
            invalid_limit: '❌ ungültiges limit (0-99)',
            invalid_name: '❌ ungültiger name',
            user_not_found: '❌ benutzer nicht gefunden',
            user_not_in_channel: '❌ benutzer ist nicht in ihrem kanal',
            owner_must_be_in_channel: '❌ neuer besitzer muss im kanal sein'
        }
    },
    it: {
        settings: {
            title: '⚙️ impostazioni canali vocali',
            description: 'configura il sistema di canali vocali temporanei',
            join_channel: '🎤 canale di creazione',
            category: '📁 categoria',
            max_channels: '🔢 canali mass.',
            cooldown: '⏱️ tempo di attesa',
            delete_delay: '🗑️ ritardo di eliminazione',
            status: '✅ stato',
            language: '🌐 lingua',
            not_set: 'non impostato',
            enabled: 'attivato',
            disabled: 'disattivato',
            footer: 'le impostazioni si aggiornano in tempo reale'
        },
        options: {
            select_join: 'seleziona canale di creazione',
            select_category: 'seleziona categoria per canali temporanei',
            configure: 'configura altre impostazioni',
            max_channels_label: 'imposta canali massimi',
            max_channels_desc: 'numero massimo di canali temporanei (1-50)',
            cooldown_label: 'imposta tempo di attesa',
            cooldown_desc: 'tempo tra le creazioni di canali (0-3600s)',
            delete_delay_label: 'imposta ritardo di eliminazione',
            delete_delay_desc: 'ritardo prima di eliminare canali vuoti (5-300s)',
            toggle_system_label: 'attiva/disattiva sistema',
            toggle_system_desc: 'attiva/disattiva l\'intero sistema'
        },
        buttons: {
            lock: 'blocca',
            unlock: 'sblocca',
            limit: 'limite',
            rename: 'rinomina',
            kick: 'espelli',
            transfer: 'trasferisci',
            close: 'chiudi',
            refresh: 'aggiorna'
        },
        embeds: {
            title: '🎙️ controlli canale vocale',
            description: 'il tuo canale vocale temporaneo è stato creato!',
            status: '🔒 stato',
            limit: '👥 limite utenti',
            owner: '👑 proprietario',
            channel_name: '📝 nome canale',
            locked: 'bloccato',
            unlocked: 'sbloccato',
            no_limit: 'nessun limite',
            footer: 'usa i pulsanti qui sotto per gestire il tuo canale'
        },
        modals: {
            limit_title: 'imposta limite utenti',
            limit_label: 'limite (0-99)',
            rename_title: 'rinomina canale',
            rename_label: 'nuovo nome canale',
            kick_title: 'espelli utente',
            kick_label: 'id utente o nome',
            kick_placeholder: 'inserisci id utente o nome',
            transfer_title: 'trasferisci proprietà',
            transfer_label: 'id nuovo proprietario o nome',
            transfer_placeholder: 'inserisci id utente o nome'
        },
        errors: {
            no_permission: '❌ non hai il permesso.',
            not_owner: '❌ non sei il proprietario di questo canale.',
            no_channel: '❌ canale non trovato.',
            not_in_voice: '❌ devi essere in un canale vocale.',
            invalid_limit: '❌ limite non valido (0-99)',
            invalid_name: '❌ nome non valido',
            user_not_found: '❌ utente non trovato',
            user_not_in_channel: '❌ l\'utente non è nel tuo canale',
            owner_must_be_in_channel: '❌ il nuovo proprietario deve essere nel canale'
        }
    },
    ru: {
        settings: {
            title: '⚙️ настройки голосовых каналов',
            description: 'настройте систему временных голосовых каналов',
            join_channel: '🎤 канал создания',
            category: '📁 категория',
            max_channels: '🔢 макс. каналов',
            cooldown: '⏱️ время ожидания',
            delete_delay: '🗑️ задержка удаления',
            status: '✅ статус',
            language: '🌐 язык',
            not_set: 'не установлено',
            enabled: 'включено',
            disabled: 'отключено',
            footer: 'настройки обновляются в реальном времени'
        },
        options: {
            select_join: 'выбрать канал создания',
            select_category: 'выбрать категорию для временных каналов',
            configure: 'настроить другие параметры',
            max_channels_label: 'установить максимум каналов',
            max_channels_desc: 'максимальное количество временных каналов (1-50)',
            cooldown_label: 'установить время ожидания',
            cooldown_desc: 'время между созданиями каналов (0-3600s)',
            delete_delay_label: 'установить задержку удаления',
            delete_delay_desc: 'задержка перед удалением пустых каналов (5-300s)',
            toggle_system_label: 'включить/выключить систему',
            toggle_system_desc: 'включить/выключить всю систему'
        },
        buttons: {
            lock: 'закрыть',
            unlock: 'открыть',
            limit: 'лимит',
            rename: 'переим.',
            kick: 'кикнуть',
            transfer: 'передать',
            close: 'удалить',
            refresh: 'обновить'
        },
        embeds: {
            title: '🎙️ управление голосовым каналом',
            description: 'ваш временный голосовой канал создан!',
            status: '🔒 статус',
            limit: '👥 лимит',
            owner: '👑 владелец',
            channel_name: '📝 название',
            locked: 'закрыт',
            unlocked: 'открыт',
            no_limit: 'нет лимита',
            footer: 'используйте кнопки ниже для управления каналом'
        },
        modals: {
            limit_title: 'установить лимит',
            limit_label: 'лимит (0-99)',
            rename_title: 'переименовать канал',
            rename_label: 'новое название',
            kick_title: 'кикнуть пользователя',
            kick_label: 'id или имя',
            kick_placeholder: 'введите id или имя',
            transfer_title: 'передать владение',
            transfer_label: 'id нового владельца',
            transfer_placeholder: 'введите id или имя'
        },
        errors: {
            no_permission: '❌ у вас нет прав.',
            not_owner: '❌ вы не владелец этого канала.',
            no_channel: '❌ канал не найден.',
            not_in_voice: '❌ вы должны быть в голосовом канале.',
            invalid_limit: '❌ неверный лимит (0-99)',
            invalid_name: '❌ неверное имя',
            user_not_found: '❌ пользователь не найден',
            user_not_in_channel: '❌ пользователь не в вашем канале',
            owner_must_be_in_channel: '❌ новый владелец должен быть в канале'
        }
    },
    zh: {
        settings: {
            title: '⚙️ 语音频道设置',
            description: '配置您的服务器临时语音频道系统',
            join_channel: '🎤 创建频道',
            category: '📁 分类',
            max_channels: '🔢 最大频道数',
            cooldown: '⏱️ 冷却时间',
            delete_delay: '🗑️ 删除延迟',
            status: '✅ 状态',
            language: '🌐 语言',
            not_set: '未设置',
            enabled: '已启用',
            disabled: '已禁用',
            footer: '设置实时更新'
        },
        options: {
            select_join: '选择创建频道',
            select_category: '选择临时频道分类',
            configure: '配置其他设置',
            max_channels_label: '设置最大频道数',
            max_channels_desc: '临时频道的最大数量 (1-50)',
            cooldown_label: '设置用户冷却时间',
            cooldown_desc: '频道创建之间的冷却时间 (0-3600秒)',
            delete_delay_label: '设置删除延迟',
            delete_delay_desc: '删除空频道前的延迟 (5-300秒)',
            toggle_system_label: '切换系统',
            toggle_system_desc: '启用/禁用整个系统'
        },
        buttons: {
            lock: '锁定',
            unlock: '解锁',
            limit: '限制',
            rename: '重命名',
            kick: '踢出',
            transfer: '移交',
            close: '关闭',
            refresh: '刷新'
        },
        embeds: {
            title: '🎙️ 语音频道控制',
            description: '您的临时语音频道已创建！',
            status: '🔒 状态',
            limit: '👥 用户限制',
            owner: '👑 所有者',
            channel_name: '📝 频道名称',
            locked: '已锁定',
            unlocked: '已解锁',
            no_limit: '无限制',
            footer: '使用下方按钮管理您的频道'
        },
        modals: {
            limit_title: '设置用户限制',
            limit_label: '限制 (0-99)',
            rename_title: '重命名频道',
            rename_label: '新频道名称',
            kick_title: '踢出用户',
            kick_label: '用户id或名称',
            kick_placeholder: '输入用户id或名称以踢出',
            transfer_title: '移交所有权',
            transfer_label: '新所有者id或名称',
            transfer_placeholder: '输入用户id或名称'
        },
        errors: {
            no_permission: '❌ 您没有权限。',
            not_owner: '❌ 您不是此频道的所有者。',
            no_channel: '❌ 未找到频道。',
            not_in_voice: '❌ 您必须在语音频道中。',
            invalid_limit: '❌ 无效的限制 (0-99)',
            invalid_name: '❌ 无效的名称',
            user_not_found: '❌ 未找到用户',
            user_not_in_channel: '❌ 用户不在您的频道中',
            owner_must_be_in_channel: '❌ 新所有者必须在频道中'
        }
    }
};

export function t(lang: string, key: string): string {
    const keys = key.split('.');
    let value: any = translations[lang as keyof typeof translations] || translations.en;

    for (const k of keys) {
        if (value) value = value[k];
        else break;
    }

    if (!value || typeof value !== 'string') {
        // Fallback to English
        value = translations.en;
        for (const k of keys) {
            if (value) value = value[k];
            else break;
        }
    }

    return value || key;
}
