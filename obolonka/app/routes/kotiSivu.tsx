import { useMemo, useState } from "react";
import { NavLink } from "react-router";
import {
  Activity,
  ArrowUpRight,
  BatteryCharging,
  Blocks,
  CalendarDays,
  ChartNoAxesCombined,
  CircuitBoard,
  Database,
  FileStack,
  Gauge,
  Grid3X3,
  HardDrive,
  LockKeyhole,
  Scale,
  Search,
  ServerCog,
  ShieldCheck,
  SlidersHorizontal,
  ThermometerSun,
  Unplug,
  Waves,
  X,
  Zap,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import type { Route } from "./+types/kotiSivu";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Smart Energy Lab — Центр керування" },
  ];
}

type ModuleCategory = "Моніторинг" | "Керування" | "Дані" | "Безпека";
type DefenseLevel = "Бакалавр" | "Магістр";
type ImplementationDate = "травень 2026" | "жовтень 2026";

type EnergyModule = {
  title: string;
  description: string;
  author: string;
  path: string;
  category: ModuleCategory;
  defenseLevel: DefenseLevel;
  implementedAt: ImplementationDate;
  icon: LucideIcon;
  accent: string;
};

const modules: EnergyModule[] = [
  { title: "Smart Energy EMS", description: "Керування режимами енергосистеми та моделювання її функціональної стійкості.", author: "Троян", path: "/func_stab_Troian", category: "Керування", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: Gauge, accent: "lime" },
  { title: "Моніторинг енергосистеми", description: "Оперативні показники, аналітика та порівняння параметрів електричної мережі.", author: "Монастирний", path: "/Monitoring_Monastyrnyi", category: "Моніторинг", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: Activity, accent: "cyan" },
  { title: "Функціональна стійкість", description: "Спостереження за станом пристроїв і стабільністю роботи енергетичної системи.", author: "Шевченко", path: "/functional-stability-shevchenko", category: "Моніторинг", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: ChartNoAxesCombined, accent: "blue" },
  { title: "Моделювання теплових потоків", description: "Побудова схеми та симуляція розподілу теплової енергії між компонентами.", author: "Heat Flow", path: "/heat-flow", category: "Керування", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: Waves, accent: "orange" },
  { title: "Адаптивний клімат-контроль", description: "Керування температурою приміщення на основі телеметрії MQTT, фільтра EKF та прогнозної моделі MPC.", author: "Червоний", path: "/adaptive-climate-Chervonyi", category: "Керування", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: ThermometerSun, accent: "cyan" },
  { title: "Smart Energy Build System", description: "Інтелектуальний контроль енергоспоживання та обладнання розумної будівлі.", author: "Іщук", path: "/smart-energy", category: "Керування", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: Blocks, accent: "emerald" },
  { title: "Акумуляторна система", description: "Контроль заряду, стану та ключових параметрів акумуляторного обладнання.", author: "Колодько", path: "/Battery_Kolodko", category: "Моніторинг", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: BatteryCharging, accent: "green" },
  { title: "Гібридний інвертор", description: "Панель керування інвертором з історією показників і налаштуваннями роботи.", author: "Досмухамедов", path: "/HybridInverter_Dosmukhamedov", category: "Керування", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: CircuitBoard, accent: "amber" },
  { title: "Синусоїдальний інвертор", description: "Моделювання вихідного сигналу та параметрів роботи силового інвертора.", author: "Sinus Inverter", path: "/sinusInvertor", category: "Керування", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: Unplug, accent: "violet" },
  { title: "Ефективне використання", description: "Аналітика, історія та прогнозування для оптимізації споживання енергії.", author: "Барабаш", path: "/effective-use", category: "Моніторинг", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: Zap, accent: "yellow" },
  { title: "Балансування енергії", description: "Баланс сонячної й вітрової генерації, споживання та акумулятора з історією і прогнозом.", author: "Гойчук", path: "/energy-balance-hoichuk", category: "Керування", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: Scale, accent: "emerald" },
  { title: "Сховище документів", description: "Робота з документами й файлами через централізований інтерфейс сховища.", author: "Шевченко О.", path: "/docs-storage-ShevchenkoO", category: "Дані", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: FileStack, accent: "violet" },
  { title: "Реляційне сховище", description: "Перегляд і керування структурованими даними в реляційному сховищі.", author: "Онопрієнко", path: "/relational-warehouse-Onopriienko", category: "Дані", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: Database, accent: "sky" },
  { title: "Керування даними", description: "Єдина панель для пошуку, перегляду та операцій з різними типами даних.", author: "Риженко", path: "/DataManager_Ryzhenko", category: "Дані", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: HardDrive, accent: "indigo" },
  { title: "IoT Gateway", description: "Підключення, обмін повідомленнями та керування пристроями енергетичної IoT-мережі.", author: "IoT", path: "/iot-gateway", category: "Дані", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: ServerCog, accent: "teal" },
  { title: "Кіберзахист", description: "Оцінювання загроз і захист цифрової інфраструктури розумної енергосистеми.", author: "Кротенко", path: "/cybersecurity", category: "Безпека", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: ShieldCheck, accent: "rose" },
  { title: "Контроль доступу Zero Trust", description: "Автентифікація, ролі та контроль доступу до операцій за моделлю Zero Trust.", author: "Стельмах", path: "/zero-trust-Stelmakh", category: "Безпека", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: LockKeyhole, accent: "fuchsia" },
  { title: "Захист телеметрії", description: "Контроль цілісності телеметричних даних та виявлення підозрілої активності.", author: "Медведєв", path: "/telemetry-security-medvediev", category: "Безпека", defenseLevel: "Магістр", implementedAt: "жовтень 2026", icon: ShieldCheck, accent: "red" },
  { title: "Криптомоніторинг", description: "Моніторинг подій, журналів і статистики криптографічного захисту системи.", author: "Губін", path: "/cryptomonitoring_Hubin", category: "Безпека", defenseLevel: "Бакалавр", implementedAt: "травень 2026", icon: LockKeyhole, accent: "purple" },
];

const categories: Array<"Усі" | ModuleCategory> = ["Усі", "Моніторинг", "Керування", "Дані", "Безпека"];
const implementationDates: Array<"Усі дати" | ImplementationDate> = ["Усі дати", "травень 2026", "жовтень 2026"];

export default function Home() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<(typeof categories)[number]>("Усі");
  const [implementationDate, setImplementationDate] = useState<(typeof implementationDates)[number]>("Усі дати");

  const filteredModules = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase("uk");
    return modules.filter((module) => {
      const matchesCategory = category === "Усі" || module.category === category;
      const matchesDate = implementationDate === "Усі дати" || module.implementedAt === implementationDate;
      const searchableText = `${module.title} ${module.description} ${module.author} ${module.category} ${module.defenseLevel} ${module.implementedAt}`.toLocaleLowerCase("uk");
      return matchesCategory && matchesDate && searchableText.includes(normalizedQuery);
    });
  }, [category, implementationDate, query]);

  return (
    <main className="home-shell">
      <div className="home-glow home-glow--one" aria-hidden="true" />
      <div className="home-glow home-glow--two" aria-hidden="true" />

      <header className="home-header">
        <NavLink to="/" className="home-brand" aria-label="Smart Energy Lab — головна">
          <span className="home-brand__mark"><Zap size={20} strokeWidth={2.4} /></span>
          <span><strong>Smart Energy</strong><small>Laboratory</small></span>
        </NavLink>
        <div className="home-header__meta"><span className="home-status-dot" aria-hidden="true" />Єдиний простір лабораторії</div>
      </header>

      <section className="home-hero">
        <div className="home-eyebrow"><span>Energy management platform</span><span className="home-eyebrow__line" /><span>2026</span></div>
        <div className="home-hero__grid">
          <div>
            <h1>Керуйте енергією.<br /><em>Бачте всю систему.</em></h1>
            <p>Центр доступу до інструментів моніторингу, керування даними, моделювання та захисту інтелектуальної енергосистеми.</p>
          </div>
          <div className="home-hero__stats" aria-label="Статистика платформи">
            <div><strong>{modules.length}</strong><span>модулів</span></div>
            <div><strong>{categories.length - 1}</strong><span>напрями</span></div>
          </div>
        </div>
      </section>

      <section className="home-directory" aria-labelledby="modules-title">
        <div className="home-directory__heading">
          <div><span className="home-kicker">Навігація</span><h2 id="modules-title">Модулі системи</h2></div>
          <p>{filteredModules.length} з {modules.length}</p>
        </div>

        <div className="home-tools">
          <label className="home-search">
            <Search size={20} aria-hidden="true" />
            <span className="sr-only">Пошук модулів</span>
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Знайти модуль, функцію або автора…" type="search" />
            {query && <button type="button" onClick={() => setQuery("")} aria-label="Очистити пошук"><X size={18} /></button>}
          </label>

          <div className="home-filters" aria-label="Фільтр за категорією">
            <SlidersHorizontal size={17} aria-hidden="true" />
            {categories.map((item) => (
              <button type="button" key={item} className={category === item ? "is-active" : ""} onClick={() => setCategory(item)} aria-pressed={category === item}>{item}</button>
            ))}
          </div>

          <label className="home-date-filter">
            <CalendarDays size={18} aria-hidden="true" />
            <span className="sr-only">Фільтр за датою впровадження</span>
            <select value={implementationDate} onChange={(event) => setImplementationDate(event.target.value as (typeof implementationDates)[number])}>
              {implementationDates.map((date) => <option value={date} key={date}>{date}</option>)}
            </select>
          </label>
        </div>

        {filteredModules.length > 0 ? (
          <div className="home-module-grid">
            {filteredModules.map((module, index) => {
              const Icon = module.icon;
              return (
                <NavLink to={module.path} className="home-module-card" data-accent={module.accent} key={module.path} style={{ "--card-index": index } as React.CSSProperties}>
                  <div className="home-module-card__top">
                    <span className="home-module-card__icon"><Icon size={22} strokeWidth={1.9} /></span>
                    <ArrowUpRight className="home-module-card__arrow" size={21} />
                  </div>
                  <div className="home-module-card__content">
                    <div className="home-module-card__meta">
                      <span className="home-module-card__category">{module.category}</span>
                      <span className="home-module-card__degree">{module.defenseLevel}</span>
                    </div>
                    <h3>{module.title}</h3>
                    <p>{module.description}</p>
                  </div>
                  <div className="home-module-card__footer">
                    <div><span>Автор / команда</span><strong>{module.author}</strong></div>
                    <div><span>Впроваджено</span><strong>{module.implementedAt}</strong></div>
                  </div>
                </NavLink>
              );
            })}
          </div>
        ) : (
          <div className="home-empty">
            <Grid3X3 size={30} />
            <h3>Нічого не знайдено</h3>
            <p>Спробуйте інший запит або скиньте вибраний фільтр.</p>
            <button type="button" onClick={() => { setQuery(""); setCategory("Усі"); setImplementationDate("Усі дати"); }}>Показати всі модулі</button>
          </div>
        )}
      </section>

      <footer className="home-footer"><span>Smart Energy Lab</span><p>Інтелектуальна енергосистема</p><span>© 2026</span></footer>
    </main>
  );
}
