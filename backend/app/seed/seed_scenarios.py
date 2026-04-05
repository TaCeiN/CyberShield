import asyncio
import uuid

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import async_session
from app.models.scenario import Scenario
from app.models.mission import Mission, MissionStep, StepChoice
from app.models.achievement import Achievement, UserAchievement


SCENARIOS_DATA = [
    {
        "slug": "office",
        "title": "Офис",
        "description": "Рабочая среда: мессенджеры, почта, звонки",
        "icon": "🏢",
        "difficulty": 1,
        "order_index": 1,
        "missions": [
            {
                "slug": "phishing_email_it",
                "title": "Фишинговое письмо от IT-отдела",
                "attack_type": "phishing",
                "environment": "email",
                "difficulty": 1,
                "xp_reward": 100,
                "story_text": "Вы на работе, проверяете почту. Пришло новое письмо от IT-отдела...",
                "order_index": 1,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "email_incoming",
                        "context_text": "Письмо с темой 'Срочно: ваш пароль истекает через 24 часа'",
                        "context_data": {
                            "sender": "it-support@c0mpany.ru",
                            "sender_display": "IT-поддержка",
                            "subject": "Срочно: ваш пароль истекает через 24 часа",
                            "body": "Уважаемый сотрудник,\n\nВаш корпоративный пароль истекает через 24 часа. Для продолжения работы необходимо обновить пароль по ссылке ниже:\n\nhttps://c0mpany-portal.ru/reset-password\n\nЕсли вы не обновите пароль, доступ к корпоративным ресурсам будет заблокирован.\n\nС уважением,\nIT-отдел",
                            "attachments": [],
                            "timestamp": "09:15"
                        },
                        "choices": [
                            {
                                "choice_text": "Перейти по ссылке и обновить пароль",
                                "is_correct": False,
                                "hp_change": -25,
                                "feedback_text": "Вы перешли на фишинговый сайт! Адрес c0mpany.ru содержит цифру '0' вместо буквы 'о'. Настоящий домен компании — company.ru. Злоумышленник получил ваш пароль.",
                                "consequence_text": "Злоумышленник получил доступ к вашему корпоративному аккаунту, скачал конфиденциальные документы и разослал фишинговые письма от вашего имени.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Переслать коллеге с вопросом 'Это настоящее письмо?'",
                                "is_correct": False,
                                "hp_change": -10,
                                "feedback_text": "Пересылка подозрительных писем коллегам распространяет угрозу. Коллега может случайно кликнуть по ссылке. Лучше сообщить в IT-отдел напрямую.",
                                "consequence_text": "Ваш коллега перешёл по ссылке и тоже стал жертвой фишинга.",
                                "order_index": 1
                            },
                            {
                                "choice_text": "Проверить адрес отправителя и сообщить в IT-отдел",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Отлично! Вы заметили подозрительный адрес отправителя (c0mpany.ru вместо company.ru) и сообщили в настоящий IT-отдел. Правило: всегда проверяйте домен отправителя, обращая внимание на замену символов (0/O, l/I, rn/m).",
                                "consequence_text": None,
                                "order_index": 2
                            },
                            {
                                "choice_text": "Просто удалить письмо",
                                "is_correct": False,
                                "hp_change": -5,
                                "feedback_text": "Удалить — лучше, чем кликать по ссылке, но вы не предупредили IT-отдел. Другие сотрудники могут получить такое же письмо и стать жертвами. Всегда сообщайте о подозрительных письмах.",
                                "consequence_text": "Три других сотрудника получили такое же письмо и перешли по ссылке.",
                                "order_index": 3
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "suspicious_file_messenger",
                "title": "Подозрительный файл в мессенджере",
                "attack_type": "social_engineering",
                "environment": "messenger",
                "difficulty": 2,
                "xp_reward": 120,
                "story_text": "Вам пишет коллега в рабочем мессенджере с просьбой срочно посмотреть файл...",
                "order_index": 2,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "messenger_msg",
                        "context_text": "Сообщение от коллеги с прикреплённым файлом",
                        "context_data": {
                            "contact_name": "Алексей Смирнов",
                            "contact_role": "Бухгалтерия",
                            "messages": [
                                {"from": "contact", "text": "Привет! Срочно посмотри отчет за квартал", "time": "14:32"},
                                {"from": "contact", "text": "Шеф просил до конца дня", "time": "14:32"},
                                {"from": "contact", "file": {"name": "report_Q4.exe", "size": "2.4 MB", "icon": "document"}, "time": "14:33"}
                            ]
                        },
                        "choices": [
                            {
                                "choice_text": "Скачать и открыть файл",
                                "is_correct": False,
                                "hp_change": -25,
                                "feedback_text": "Файл report_Q4.exe — исполняемый файл (.exe), а не документ! Настоящие отчёты имеют расширения .xlsx, .pdf, .docx. Запуск .exe файла из мессенджера — прямой путь к заражению компьютера вирусом.",
                                "consequence_text": "Вирус-шифровальщик зашифровал все файлы на вашем компьютере и потребовал выкуп в криптовалюте.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Позвонить Алексею и спросить, он ли это отправил",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Правильно! Вы связались с коллегой по другому каналу и выяснили, что его аккаунт был взломан. Правило: если коллега присылает неожиданный файл, особенно .exe — всегда перезвоните или спросите лично.",
                                "consequence_text": None,
                                "order_index": 1
                            },
                            {
                                "choice_text": "Открыть файл в песочнице (sandbox)",
                                "is_correct": False,
                                "hp_change": -5,
                                "feedback_text": "Открытие в песочнице — продвинутый подход, но не все пользователи имеют к ней доступ. Главная ошибка — вы не уточнили у отправителя, действительно ли он отправлял файл. Начинайте с верификации отправителя.",
                                "consequence_text": None,
                                "order_index": 2
                            },
                            {
                                "choice_text": "Игнорировать сообщение",
                                "is_correct": False,
                                "hp_change": -5,
                                "feedback_text": "Игнорировать безопаснее, чем открывать, но вы не предупредили коллегу, что его аккаунт, возможно, взломан. Сообщите ему и в IT-отдел.",
                                "consequence_text": "Другие сотрудники получили аналогичные файлы и открыли их.",
                                "order_index": 3
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "fake_bank_call",
                "title": "Звонок от 'службы безопасности банка'",
                "attack_type": "social_engineering",
                "environment": "phone_settings",
                "difficulty": 2,
                "xp_reward": 150,
                "story_text": "Вам звонят с номера, похожего на номер вашего банка. Звонящий представляется сотрудником службы безопасности...",
                "order_index": 3,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "phone_notification",
                        "context_text": "Входящий звонок от 'Центр-Инвест Банк'",
                        "context_data": {
                            "screen": "incoming_call",
                            "caller_name": "Центр-Инвест Банк",
                            "caller_number": "+7 (863) 200-00-00",
                            "call_script": "Здравствуйте! Это служба безопасности банка Центр-Инвест. Мы зафиксировали подозрительную транзакцию на сумму 15 000 рублей с вашей карты. Для отмены операции назовите, пожалуйста, CVV-код и срок действия вашей карты."
                        },
                        "choices": [
                            {
                                "choice_text": "Назвать CVV-код для отмены транзакции",
                                "is_correct": False,
                                "hp_change": -25,
                                "feedback_text": "Сотрудники банка НИКОГДА не запрашивают CVV-код, PIN-код или полный номер карты по телефону! Это мошенник. Он использует подменённый номер (спуфинг), чтобы выглядеть как настоящий банк.",
                                "consequence_text": "Мошенник списал с вашей карты 47 000 рублей несколькими транзакциями.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Повесить трубку и позвонить в банк самостоятельно",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Абсолютно верно! Вы положили трубку и перезвонили на официальный номер банка. Оказалось — никаких подозрительных транзакций нет. Правило: при любых звонках от 'банка' — кладите трубку и звоните сами по номеру с карты или из приложения.",
                                "consequence_text": None,
                                "order_index": 1
                            },
                            {
                                "choice_text": "Попросить перезвонить позже",
                                "is_correct": False,
                                "hp_change": -10,
                                "feedback_text": "Мошенник перезвонит и продолжит давить. Откладывание — не решение. Нужно прервать контакт и самостоятельно связаться с банком.",
                                "consequence_text": "Мошенник перезвонил через 10 минут, создал ещё большую панику и вы сообщили данные.",
                                "order_index": 2
                            },
                            {
                                "choice_text": "Сказать, что вы не клиент этого банка",
                                "is_correct": False,
                                "hp_change": -5,
                                "feedback_text": "Мошенник заранее знает, какой у вас банк (данные утечки). Ваша ложь его не остановит, он переключится на другую тактику. Единственное верное решение — повесить трубку.",
                                "consequence_text": None,
                                "order_index": 3
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "slug": "home",
        "title": "Дом",
        "description": "Домашняя среда: роутер, браузер, соцсети",
        "icon": "🏠",
        "difficulty": 2,
        "order_index": 2,
        "missions": [
            {
                "slug": "weak_wifi_password",
                "title": "Слабый пароль на Wi-Fi роутере",
                "attack_type": "password_brute",
                "environment": "phone_settings",
                "difficulty": 1,
                "xp_reward": 100,
                "story_text": "Вы настраиваете новый роутер дома. Сейчас стоит пароль по умолчанию...",
                "order_index": 1,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "phone_notification",
                        "context_text": "Панель управления роутером",
                        "context_data": {
                            "screen": "router_admin",
                            "router_model": "TP-Link Archer",
                            "current_ssid": "TP-Link_A4F2",
                            "current_password": "admin123",
                            "admin_login": "admin",
                            "admin_password": "admin"
                        },
                        "choices": [
                            {
                                "choice_text": "Оставить пароль admin123 — и так работает",
                                "is_correct": False,
                                "hp_change": -20,
                                "feedback_text": "Пароль admin123 подбирается за секунды! Он входит в топ-10 самых распространённых паролей. Любой сосед может подключиться к вашей сети.",
                                "consequence_text": "Сосед подключился к вашему Wi-Fi, перехватил ваш трафик и получил доступ к вашей почте.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Сменить на P@ssw0rd — выглядит надёжно",
                                "is_correct": False,
                                "hp_change": -10,
                                "feedback_text": "P@ssw0rd — популярная вариация, которая тоже есть в словарях для подбора. Замена букв на символы (@=a, 0=o) давно известна взломщикам.",
                                "consequence_text": "Пароль был подобран за 2 минуты с помощью словарной атаки.",
                                "order_index": 1
                            },
                            {
                                "choice_text": "Создать пароль из 12+ символов: буквы, цифры, спецсимволы",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Отлично! Длинный случайный пароль (например, 'kF9$mNx2!pLq') практически невозможно подобрать. Правило: минимум 12 символов, смесь регистров, цифр и спецсимволов. Используйте менеджер паролей.",
                                "consequence_text": None,
                                "order_index": 2
                            },
                            {
                                "choice_text": "Отключить пароль — удобнее без него",
                                "is_correct": False,
                                "hp_change": -25,
                                "feedback_text": "Открытая Wi-Fi сеть — это приглашение для злоумышленников! Любой человек в радиусе действия может подключиться, перехватить ваш трафик и даже использовать вашу сеть для незаконных действий.",
                                "consequence_text": "Через вашу открытую сеть совершены незаконные действия. Полиция пришла к вам.",
                                "order_index": 3
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "fake_browser_update",
                "title": "Фейковое обновление приложения",
                "attack_type": "phishing",
                "environment": "browser",
                "difficulty": 2,
                "xp_reward": 120,
                "story_text": "Вы просматриваете сайт, и вдруг появляется всплывающее окно...",
                "order_index": 2,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "browser_popup",
                        "context_text": "Всплывающее окно предупреждает об устаревшем браузере",
                        "context_data": {
                            "url": "chr0me-update.download/urgent",
                            "page_title": "Обновление Chrome",
                            "popup": {
                                "title": "⚠️ Ваш браузер устарел!",
                                "text": "Обнаружена критическая уязвимость. Скачайте обновление немедленно для защиты ваших данных.",
                                "button": "Скачать обновление Chrome",
                                "file": "chrome_update.exe"
                            }
                        },
                        "choices": [
                            {
                                "choice_text": "Скачать обновление по ссылке",
                                "is_correct": False,
                                "hp_change": -25,
                                "feedback_text": "Это фейковый сайт! URL chr0me-update.download — не принадлежит Google. Настоящие обновления Chrome устанавливаются автоматически или через меню браузера (⋮ → Справка → О браузере).",
                                "consequence_text": "Вы скачали и запустили вредоносное ПО, которое установило кейлоггер на ваш компьютер.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Закрыть вкладку и обновить через настройки браузера",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Правильно! Вы закрыли подозрительную вкладку и обновили браузер через официальные настройки. Правило: никогда не скачивайте обновления по ссылкам из всплывающих окон. Обновляйте ПО только через официальные каналы.",
                                "consequence_text": None,
                                "order_index": 1
                            },
                            {
                                "choice_text": "Нажать 'Напомнить позже'",
                                "is_correct": False,
                                "hp_change": -5,
                                "feedback_text": "Кнопка 'Напомнить позже' на фишинговом сайте может сама по себе запускать вредоносный скрипт. Не взаимодействуйте с подозрительными popup'ами — закрывайте вкладку целиком.",
                                "consequence_text": "Нажатие на кнопку инициировало скрытую загрузку.",
                                "order_index": 2
                            },
                            {
                                "choice_text": "Проверить URL и закрыть вкладку",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Верно! Вы проверили URL (chr0me вместо chrome, домен .download) и поняли, что это подделка. Правило: всегда проверяйте адресную строку. Официальные сайты используют домены google.com, chrome.google.com.",
                                "consequence_text": None,
                                "order_index": 3
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "social_phishing_link",
                "title": "Подозрительная ссылка от друга в соцсети",
                "attack_type": "phishing",
                "environment": "messenger",
                "difficulty": 2,
                "xp_reward": 120,
                "story_text": "Вам приходит сообщение от друга в соцсети с неожиданной ссылкой...",
                "order_index": 3,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "messenger_msg",
                        "context_text": "Сообщение от друга со ссылкой",
                        "context_data": {
                            "contact_name": "Марина Козлова",
                            "contact_role": "Друг",
                            "messages": [
                                {"from": "contact", "text": "Привееет! Смотри, тут ты на фото 😂😂", "time": "22:15"},
                                {"from": "contact", "link": {"url": "vk-photo.phishing-site.com/album?id=38291", "preview": "Фотоальбом | VK"}, "time": "22:15"}
                            ]
                        },
                        "choices": [
                            {
                                "choice_text": "Перейти по ссылке — интересно!",
                                "is_correct": False,
                                "hp_change": -20,
                                "feedback_text": "Ссылка ведёт на фишинговый сайт vk-photo.phishing-site.com, а не на настоящий vk.com. После перехода вас попросят ввести логин и пароль от VK — и они уйдут мошеннику.",
                                "consequence_text": "Ваш аккаунт ВКонтакте взломан. С него рассылаются аналогичные сообщения вашим друзьям.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Спросить Марину, что за ссылка",
                                "is_correct": False,
                                "hp_change": -3,
                                "feedback_text": "Спрашивать через тот же мессенджер бесполезно — если аккаунт Марины взломан, мошенник ответит за неё. Лучше позвонить или написать в другом мессенджере.",
                                "consequence_text": None,
                                "order_index": 1
                            },
                            {
                                "choice_text": "Проверить URL и предупредить Марину, что её могли взломать",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Отлично! Вы заметили поддельный домен (vk-photo.phishing-site.com вместо vk.com) и предупредили подругу по телефону. Она сменила пароль. Правило: если друг присылает подозрительную ссылку — проверьте URL и свяжитесь с другом по другому каналу.",
                                "consequence_text": None,
                                "order_index": 2
                            },
                            {
                                "choice_text": "Заблокировать Марину",
                                "is_correct": False,
                                "hp_change": -5,
                                "feedback_text": "Блокировка не поможет ни вам, ни Марине. Её аккаунт всё ещё взломан и продолжает рассылать фишинговые ссылки. Нужно предупредить её по другому каналу.",
                                "consequence_text": "Аккаунт Марины продолжает рассылать фишинг другим людям.",
                                "order_index": 3
                            }
                        ]
                    }
                ]
            }
        ]
    },
    {
        "slug": "public_wifi",
        "title": "Общественный Wi-Fi",
        "description": "Кафе, аэропорт, торговый центр",
        "icon": "📡",
        "difficulty": 3,
        "order_index": 3,
        "missions": [
            {
                "slug": "evil_twin_wifi",
                "title": "Evil Twin — поддельная точка доступа",
                "attack_type": "mitm",
                "environment": "wifi",
                "difficulty": 2,
                "xp_reward": 130,
                "story_text": "Вы в кафе и хотите подключиться к Wi-Fi. Видите несколько доступных сетей...",
                "order_index": 1,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "wifi_list",
                        "context_text": "Список доступных Wi-Fi сетей в кафе",
                        "context_data": {
                            "location": "Кофейня 'Аромат'",
                            "networks": [
                                {"name": "CoffeeShop_Free", "signal_strength": 3, "is_secured": False, "is_fake": False},
                                {"name": "CoffeeShop_Free_5G", "signal_strength": 4, "is_secured": False, "is_fake": True},
                                {"name": "CoffeeShop_Guest", "signal_strength": 2, "is_secured": True, "is_fake": False}
                            ]
                        },
                        "choices": [
                            {
                                "choice_text": "Подключиться к CoffeeShop_Free_5G — сигнал сильнее",
                                "is_correct": False,
                                "hp_change": -20,
                                "feedback_text": "Это поддельная точка доступа (Evil Twin)! Злоумышленник создал сеть с похожим названием и более сильным сигналом. Весь ваш трафик проходит через его устройство.",
                                "consequence_text": "Хакер перехватил ваши cookies, логины и пароли от сайтов без HTTPS.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Спросить у бариста название официальной Wi-Fi сети",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Правильно! Бариста сказал, что официальная сеть — CoffeeShop_Guest с паролем на чеке. Правило: в общественных местах всегда уточняйте у персонала название и пароль Wi-Fi.",
                                "consequence_text": None,
                                "order_index": 1
                            },
                            {
                                "choice_text": "Подключиться к любой и использовать VPN",
                                "is_correct": False,
                                "hp_change": -5,
                                "feedback_text": "VPN защищает трафик, но не на 100%. Между подключением и запуском VPN есть окно уязвимости. Кроме того, не все VPN одинаково надёжны. Лучше сначала убедиться в подлинности сети.",
                                "consequence_text": None,
                                "order_index": 2
                            },
                            {
                                "choice_text": "Не подключаться и использовать мобильный интернет",
                                "is_correct": False,
                                "hp_change": 5,
                                "feedback_text": "Мобильный интернет безопаснее, но это не всегда удобно. Лучший подход — уточнить у персонала правильную сеть. Так вы и подключитесь безопасно, и сэкономите мобильный трафик.",
                                "consequence_text": None,
                                "order_index": 3
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "public_wifi_banking",
                "title": "Онлайн-банк через публичный Wi-Fi",
                "attack_type": "mitm",
                "environment": "browser",
                "difficulty": 3,
                "xp_reward": 150,
                "story_text": "Вы в кафе, подключены к публичному Wi-Fi. Нужно срочно перевести деньги...",
                "order_index": 2,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "browser_popup",
                        "context_text": "Вы хотите зайти в онлайн-банк",
                        "context_data": {
                            "url": "centrinvest.ru/online",
                            "page_title": "Центр-Инвест Онлайн",
                            "is_https": False,
                            "wifi_name": "Free_Airport_WiFi (открытая)"
                        },
                        "choices": [
                            {
                                "choice_text": "Зайти в банк как обычно — это же официальный сайт",
                                "is_correct": False,
                                "hp_change": -20,
                                "feedback_text": "На открытом Wi-Fi ваш трафик может перехватываться. Даже если сайт настоящий, данные могут быть украдены до установки HTTPS-соединения.",
                                "consequence_text": "Злоумышленник перехватил ваши данные входа в онлайн-банк.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Включить VPN, затем зайти в банк",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Правильно! VPN шифрует весь трафик между вами и VPN-сервером. Даже если кто-то перехватывает Wi-Fi, он увидит только зашифрованные данные. Правило: финансовые операции через публичный Wi-Fi — только с VPN.",
                                "consequence_text": None,
                                "order_index": 1
                            },
                            {
                                "choice_text": "Подождать до дома",
                                "is_correct": False,
                                "hp_change": 5,
                                "feedback_text": "Безопасный вариант, но не всегда возможный. Правильный подход — использовать VPN для защиты соединения.",
                                "consequence_text": None,
                                "order_index": 2
                            },
                            {
                                "choice_text": "Проверить HTTPS и зайти",
                                "is_correct": False,
                                "hp_change": -10,
                                "feedback_text": "HTTPS защищает от перехвата на уровне сайта, но на открытом Wi-Fi возможна атака SSL stripping, когда HTTPS подменяется на HTTP. VPN — более надёжная защита.",
                                "consequence_text": None,
                                "order_index": 3
                            }
                        ]
                    }
                ]
            },
            {
                "slug": "atm_skimming",
                "title": "Скимминг — подозрительный банкомат",
                "attack_type": "skimming",
                "environment": "browser",
                "difficulty": 2,
                "xp_reward": 130,
                "story_text": "Вам нужно снять наличные. Вы подходите к банкомату на улице...",
                "order_index": 3,
                "steps": [
                    {
                        "step_order": 1,
                        "context_type": "browser_popup",
                        "context_text": "Банкомат с подозрительной накладкой",
                        "context_data": {
                            "url": None,
                            "page_title": "Банкомат Центр-Инвест",
                            "description": "Банкомат расположен на улице, не в отделении банка. Картоприёмник немного выступает и отличается по цвету от корпуса. Рядом с клавиатурой видна небольшая камера.",
                            "visual_clues": ["выступающий картоприёмник", "отличие цвета накладки", "мини-камера у клавиатуры"]
                        },
                        "choices": [
                            {
                                "choice_text": "Вставить карту и снять деньги",
                                "is_correct": False,
                                "hp_change": -25,
                                "feedback_text": "На банкомат установлен скиммер — устройство для копирования данных карты. Камера снимает ваш PIN-код. Теперь мошенники могут создать дубликат вашей карты.",
                                "consequence_text": "С вашей карты были списаны 65 000 рублей в другом городе.",
                                "order_index": 0
                            },
                            {
                                "choice_text": "Пошевелить картоприёмник — если шатается, не использовать",
                                "is_correct": True,
                                "hp_change": 10,
                                "feedback_text": "Правильно! Вы проверили картоприёмник — он оказался накладкой и легко шатался. Настоящий картоприёмник является частью корпуса. Правило: перед использованием банкомата проверяйте картоприёмник, клавиатуру и ищите мини-камеры.",
                                "consequence_text": None,
                                "order_index": 1
                            },
                            {
                                "choice_text": "Позвонить в банк и сообщить о подозрении",
                                "is_correct": False,
                                "hp_change": 5,
                                "feedback_text": "Позвонить в банк — хорошая идея, но сначала убедитесь сами. Проверьте картоприёмник вручную. Если он шатается или выглядит инородно — не вставляйте карту и сообщите в банк.",
                                "consequence_text": None,
                                "order_index": 2
                            },
                            {
                                "choice_text": "Использовать бесконтактную оплату вместо снятия наличных",
                                "is_correct": False,
                                "hp_change": 0,
                                "feedback_text": "Бесконтактная оплата безопаснее, но иногда наличные необходимы. Главное — уметь проверять банкомат на наличие скиммеров. Это универсальный навык.",
                                "consequence_text": None,
                                "order_index": 3
                            }
                        ]
                    }
                ]
            }
        ]
    }
]

ACHIEVEMENTS_DATA = [
    # --- Прогресс обучения ---
    {"slug": "first_module", "title": "Первый шаг", "description": "Пройдите первый обучающий модуль", "icon": "start", "condition_type": "modules_completed", "condition_value": 1, "xp_bonus": 0, "rarity": "common"},
    {"slug": "five_modules", "title": "На пути к знаниям", "description": "Пройдите 5 обучающих модулей", "icon": "path", "condition_type": "modules_completed", "condition_value": 5, "xp_bonus": 0, "rarity": "common"},
    {"slug": "ten_modules", "title": "Половина пути", "description": "Пройдите 10 обучающих модулей", "icon": "half", "condition_type": "modules_completed", "condition_value": 10, "xp_bonus": 0, "rarity": "rare"},
    {"slug": "all_modules", "title": "Полное прохождение", "description": "Пройдите все 16 модулей обучения", "icon": "trophy", "condition_type": "modules_completed", "condition_value": 16, "xp_bonus": 0, "rarity": "legendary"},
    # --- Темы ---
    {"slug": "phishing_done", "title": "Антифишинг", "description": "Пройдите все модули темы «Фишинг»", "icon": "phishing", "condition_type": "theme_done", "condition_value": "phishing", "xp_bonus": 0, "rarity": "rare"},
    {"slug": "skimming_done", "title": "Защитник карт", "description": "Пройдите все модули темы «Скимминг»", "icon": "card", "condition_type": "theme_done", "condition_value": "skimming", "xp_bonus": 0, "rarity": "rare"},
    {"slug": "password_done", "title": "Мастер паролей", "description": "Пройдите все модули темы «Пароли»", "icon": "lock", "condition_type": "theme_done", "condition_value": "password", "xp_bonus": 0, "rarity": "rare"},
    {"slug": "social_done", "title": "Неуязвимый", "description": "Пройдите все модули «Социальная инженерия»", "icon": "users", "condition_type": "theme_done", "condition_value": "social", "xp_bonus": 0, "rarity": "rare"},
    # --- Точность ---
    {"slug": "perfect_one", "title": "Безупречно", "description": "Ответьте правильно с первого раза", "icon": "star", "condition_type": "correct_count", "condition_value": 1, "xp_bonus": 0, "rarity": "common"},
    {"slug": "perfect_five", "title": "Пятёрка!", "description": "Дайте 5 правильных ответов", "icon": "stars", "condition_type": "correct_count", "condition_value": 5, "xp_bonus": 0, "rarity": "rare"},
    {"slug": "perfect_all", "title": "Идеальный результат", "description": "Ответьте правильно на все 16 модулей", "icon": "crown", "condition_type": "correct_count", "condition_value": 16, "xp_bonus": 0, "rarity": "legendary"},
    # --- Уровень безопасности ---
    {"slug": "security_max", "title": "Максимальная защита", "description": "Достигните 100% уровня безопасности", "icon": "shield", "condition_type": "security_level", "condition_value": 100, "xp_bonus": 0, "rarity": "epic"},
    # --- XP ---
    {"slug": "xp_30", "title": "Начинающий", "description": "Наберите 30 XP", "icon": "zap", "condition_type": "xp_total", "condition_value": 30, "xp_bonus": 0, "rarity": "common"},
    {"slug": "xp_80", "title": "Защитник", "description": "Наберите 80 XP", "icon": "shield_check", "condition_type": "xp_total", "condition_value": 80, "xp_bonus": 0, "rarity": "rare"},
    {"slug": "xp_120", "title": "Эксперт", "description": "Наберите 120 XP", "icon": "award", "condition_type": "xp_total", "condition_value": 120, "xp_bonus": 0, "rarity": "epic"},
    {"slug": "xp_160", "title": "Мастер кибербезопасности", "description": "Наберите 160 XP", "icon": "medal", "condition_type": "xp_total", "condition_value": 160, "xp_bonus": 0, "rarity": "legendary"},
]


async def seed_achievements(session: AsyncSession) -> None:
    """Always re-create achievements to keep in sync with code."""
    from sqlalchemy import delete as sa_delete
    await session.execute(sa_delete(UserAchievement))
    await session.execute(sa_delete(Achievement))
    for a_data in ACHIEVEMENTS_DATA:
        achievement = Achievement(
            slug=a_data["slug"],
            title=a_data["title"],
            description=a_data["description"],
            icon=a_data["icon"],
            condition_type=a_data["condition_type"],
            condition_value=str(a_data["condition_value"]),
            xp_bonus=a_data["xp_bonus"],
            rarity=a_data["rarity"],
        )
        session.add(achievement)
    await session.commit()


async def seed_all(session: AsyncSession) -> None:
    # Always re-seed achievements
    await seed_achievements(session)

    # Check if scenario data already exists
    result = await session.execute(select(Scenario).limit(1))
    if result.scalar_one_or_none():
        return

    for sc_data in SCENARIOS_DATA:
        scenario = Scenario(
            slug=sc_data["slug"],
            title=sc_data["title"],
            description=sc_data["description"],
            icon=sc_data["icon"],
            difficulty=sc_data["difficulty"],
            order_index=sc_data["order_index"],
        )
        session.add(scenario)
        await session.flush()

        for m_data in sc_data["missions"]:
            mission = Mission(
                scenario_id=scenario.id,
                slug=m_data["slug"],
                title=m_data["title"],
                attack_type=m_data["attack_type"],
                environment=m_data["environment"],
                difficulty=m_data["difficulty"],
                xp_reward=m_data["xp_reward"],
                story_text=m_data.get("story_text"),
                order_index=m_data.get("order_index", 0),
            )
            session.add(mission)
            await session.flush()

            for s_data in m_data["steps"]:
                step = MissionStep(
                    mission_id=mission.id,
                    step_order=s_data["step_order"],
                    context_text=s_data["context_text"],
                    context_type=s_data["context_type"],
                    context_data=s_data.get("context_data"),
                )
                session.add(step)
                await session.flush()

                for c_data in s_data["choices"]:
                    choice = StepChoice(
                        step_id=step.id,
                        choice_text=c_data["choice_text"],
                        is_correct=c_data["is_correct"],
                        hp_change=c_data["hp_change"],
                        feedback_text=c_data["feedback_text"],
                        consequence_text=c_data.get("consequence_text"),
                        order_index=c_data.get("order_index", 0),
                    )
                    session.add(choice)

    await session.commit()


async def main():
    async with async_session() as session:
        await seed_all(session)


if __name__ == "__main__":
    asyncio.run(main())
