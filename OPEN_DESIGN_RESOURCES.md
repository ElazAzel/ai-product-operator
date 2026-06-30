# Open Design Resources — что применили и что можно улучшить

## Источник

Директория: `%LOCALAPPDATA%\Programs\Open Design\resources\open-design`

Open Design — AI-assisted дизайн-платформа с тремя основными слоями:
1. **design-systems/** — брендовые визуальные языки (Apple, Airbnb, Agentic + 100+ в реестре)
2. **craft/** — универсальные правила UI/UX (цвет, типографика, доступность, анимация)
3. **design-templates/** — готовые рендер-шаблоны (SaaS landing, dashboard, pitch decks, и т.д.)

---

## Что применили

### 1. Design System Tokens (из `apple/tokens.css` + `agentic/tokens.css`)

Создана полная токен-система в `src/app/globals.css`:

| Токен | Значение | Источник |
|---|---|---|
| `--accent` | `#0d9488` (teal-600) | Замена violet (anti-ai-slop правило #1) |
| `--bg` | `#0a0a0b` (не pure black) | `agentic/tokens.css` — "avoid pure black" |
| `--surface` | `#141416` (не zinc-900) | `agentic/tokens.css` |
| `--border` | `rgba(255,255,255,0.08)` на dark | `color.md` — "semi-transparent white borders" |
| `--focus-ring` | `color-mix(in oklab, accent, transparent 60%)` | `apple/tokens.css` |
| `--motion-base` | 250ms, `cubic-bezier(0.2, 0, 0, 1)` | `agentic/tokens.css` easing |
| `--tracking-display` | `-0.02em` (negative tracking на заголовках) | `typography.md` — "display text без negative tracking = AI tell" |
| `--text-base` | 15px (body) | `typography.md` scale |
| `--leading-body` | 1.55 | `typography.md` — "body 1.5–1.6" |

### 2. Anti-AI-slop правила (из `craft/anti-ai-slop.md`)

| Правило | Что сделано |
|---|---|
| **#1: Violet accent** | Все `text-violet-500` → `text-accent` или `text-muted` |
| **#2: Trust gradient** | Gradient banners на Dashboard и Money Map → flat surface с `border-t-2 border-accent` |
| **#3: Emoji as icons** | Не было нарушений (используем lucide-react) |
| **#4: Sans-serif на display** | `font-display` = geist-sans (соответствует дизайну) |
| **#5: Rounded card + left border** | Убрано (не было violations) |
| **#6: Invented metrics** | Placeholder-тексты заменены (частично) |
| **#7: Filler copy** | Уроки с реальным контентом (48 уроков) |
| **Accent overuse (≤2/экран)** | Secondary icons → `text-muted`, header icons → `text-accent` |

### 3. Typography Craft Rules (из `craft/typography.md`)

| Правило | Что сделано |
|---|---|
| Letter-spacing ALL CAPS ≥0.06em | Подготовлено через `tracking-display` |
| Negative tracking на заголовках ≥32px | `h1, h2, h3, h4 { letter-spacing: var(--tracking-display) }` |
| Line-height body 1.5-1.6 | `--leading-body: 1.55` |
| Body copy ≤65ch | Используется `max-w-4xl` на уроке (приближение) |
| 3-weight system (400/510/590) | Не внедрено (todo) |

### 4. Color Craft Rules (из `craft/color.md`)

| Правило | Что сделано |
|---|---|
| Neutrals 70-90% | Выдержано (bg, surface, fg, muted, meta) |
| Accent ≤2 visible / screen | Демотивированы secondary иконки |
| Dark theme: `#0f0f0f` bg, не `#000` | `--bg: #0a0a0b` |
| Semi-transparent borders на dark | `--border: rgba(255,255,255,0.08)` |
| Purpose-named tokens | Все токены по назначению, не по hue |

### 5. Accessibility Baseline (из `craft/accessibility-baseline.md`)

| Правило | Что сделано |
|---|---|
| Touch targets 44×44px (AAA) | Icon buttons → `h-9 w-9` (36px), частично |
| Focus-visible ring | Через `--focus-ring` токен |
| `prefers-reduced-motion` | Добавлен @media query |
| Tab reachability | Нативные `<button>` и `<a>` |
| ARIA discipline | Не нарушается (native elements) |

### 6. Animation Discipline (из `craft/animation-discipline.md`)

| Правило | Что сделано |
|---|---|
| 50-100ms — instant feedback | Button press: `active:scale-[0.98]` |
| 150ms — state confirmation | `--motion-fast: 150ms` |
| 200-300ms — entering UI | `--motion-base: 250ms` |
| No decorative animation | `animate-fade-in` только на страницах (navigation) |
| `prefers-reduced-motion` | Все анимации отключаются |

---

## Что НЕ применили (можно улучшить)

### Из Open Design resources

| Ресурс | Что можно сделать | Приоритет |
|---|---|---|
| **design-systems/apple/** | Применить полную систему: SF Pro шрифты (если доступны), 980px radius pill, Apple-style shadows | Low |
| **design-systems/agentic/** | Agentic dark theme лучше подходит для AI-продукта — можно взять `--elev-raised: 0 24px 72px` | Low |
| **design-templates/saas-landing/** | Улучшить Dashboard с hero section, feature blocks, pricing | Medium |
| **design-templates/live-dashboard/** | Референс для улучшения структуры дашборда | Medium |
| **craft/form-validation.md** (221 lines) | Улучшить валидацию форм в Evidence Vault, Lesson dialogs | Medium |
| **craft/state-coverage.md** | Добавить обработку empty/loading/error состояний на всех страницах | Medium |
| **craft/laws-of-ux.md** (296 lines) | Применить Gestalt, Fitts, Hick's law к компоновке страниц | Low |
| **craft/typography-hierarchy.md** | Внедрить иерархию заголовков для длинного чтения (уроки) | Low |

### Из Anti-AI-slop, что осталось

| Правило | Текущее состояние | Что нужно |
|---|---|---|
| **P1: External placeholder CDN** | Используем локальные описания | Проверить все placeholder-тексты |
| **P1: >12 raw hex outside `:root`** | Исправлено — все hex в `globals.css` | OK |
| **P2: Sections without `data-od-id`** | Не внедрено | Добавить data-атрибуты (если нужно) |
| **P2: Decorative SVG backgrounds** | Нет | OK |
| **P2: Perfect symmetric layout** | Есть на некоторых страницах | Добавить визуальное напряжение |

### Из Typography, что осталось

| Правило | Что нужно |
|---|---|
| **ALL CAPS letter-spacing** | Найти все ALL CAPS элементы (settings labels, статусы) и добавить `tracking-wider` |
| **Body copy 50-75ch** | Добавить `max-w-[65ch]` на lesson content |
| **Max 3 type sizes above fold** | Проверить каждую страницу |
| **Letter-spacing UI labels +0.02em** | Добавить на button text, nav items |
| **Display 48px+ negative tracking -0.03em** | Для `text-4xl` и больше |

### Из будущих улучшений

| Что | Зачем | Когда |
|---|---|---|
| **Device frames** (`frames/iphone-15-pro.html` и т.д.) | Предпросмотр мобильной версии в браузере | При тестировании |
| **Design system registry** (100+ систем) | Сменить тему на Linear, Notion, или кастомную | При rebranding |
| **Prompt templates** (`prompt-templates/image/`) | Генерация изображений для артефактов | При добавлении AI-фич |
| **html-ppt-course-module/** | Создание презентаций курса | При запуске Academy |
| **Skills** (140+ stubs) | `shadcn-ui`, `color-expert`, `frontend-design` для дальнейшего улучшения | По необходимости |

---

## Как использовать Open Design для дальнейших улучшений

```bash
# Быстрый доступ к дизайн-системам
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\design-systems\apple\
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\design-systems\agentic\

# Craft правила — читать перед любыми UI-изменениями
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\craft\anti-ai-slop.md
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\craft\color.md
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\craft\typography.md
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\craft\accessibility-baseline.md
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\craft\animation-discipline.md

# Шаблоны страниц — референс для редизайна
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\design-templates\saas-landing\
%LOCALAPPDATA%\Programs\Open Design\resources\open-design\design-templates\live-dashboard\
```

---

## Текущие токены (быстрый справочник)

```
Light:   bg=#fafafa  surface=#ffffff  fg=#18181b  accent=#0d9488  border=#e4e4e7
Dark:    bg=#0a0a0b  surface=#141416  fg=#f4f4f5  accent=#0d9488  border=rgba(255,255,255,0.08)

Tailwind-классы: bg-surface, text-fg, text-muted, text-accent, bg-accent-subtle, border-border
```
