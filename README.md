# L10n Overview - Svenska översättningar i Open Source

En omfattande webbapplikation för att övervaka svenska översättningar i de största open source-projekten.

## 🎯 Funktioner

### Frontend
- **Sökbar projektlista** med 5000+ open source-projekt
- **Sorterbar tabell** efter stjärnor, uppdateringar, kvalitet, etc.
- **Avancerade filter** för kategori, plattform, översättningsstatus
- **Interaktiva grafer** med Chart.js för statistik och trender
- **Responsiv design** som fungerar på alla enheter
- **Real-time uppdateringar** varje timme

### Backend API
- **Datainsamling** från Weblate, GitHub, Crowdin, Transifex
- **REST API** för frontend med paginering och filtrering
- **Kvalitetspoäng** baserad på framsteg och plattform
- **Caching** för optimal prestanda
- **Background jobs** för datauppdatering

### Datakällor
- **Weblate** - Hosted.weblate.org API
- **GitHub** - Repository search + l10n file detection
- **Crowdin** - Publika projekt
- **Transifex** - Open source-projekt
- **KDE** - KDE l10n system
- **GNOME** - GNOME översättningar

## 🚀 Snabbstart

### Lokalt (utveckling)

```bash
# Klona repot
git clone https://github.com/yeager/l10n-overview
cd l10n-overview

# Backend setup
cd api
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Sätt API-nycklar (valfritt för utveckling)
export GITHUB_TOKEN="ghp_your_token"
export WEBLATE_TOKEN="your_weblate_token"

# Samla initial data
python collect.py

# Starta API server
python server.py
```

API körs nu på http://localhost:8000

```bash
# Frontend (öppna i ny terminal)
cd ..
python -m http.server 3000  # Eller använd Live Server i VS Code
```

Frontend tillgängligt på http://localhost:3000

### Produktion (danielnylander.se/l10n-overview)

```bash
# På servern
chmod +x deploy.sh
sudo ./deploy.sh
```

Deployment-skriptet hanterar:
- Nginx-konfiguration
- SSL-certifikat med Let's Encrypt
- Systemd-service för API
- Cron-jobb för datauppdatering
- Säkerhetsinställningar

## 📊 API Endpoints

### Projektdata
```http
GET /api/projects
```
**Parametrar:**
- `page` - Sidnummer (default: 1)
- `page_size` - Antal per sida (default: 50, max: 200)
- `search` - Sökterm för namn/kategori/plattform
- `category` - Filtrera efter kategori
- `platform` - Filtrera efter plattform
- `status` - Översättningsstatus (complete/partial/minimal/none/missing)
- `sort_by` - Sortera efter fält (name/stars/swedish_progress/last_update/quality)
- `sort_order` - asc/desc

**Exempel:**
```bash
# De mest populära projekten med delvis svenska översättning
curl "https://danielnylander.se/l10n-overview/api/projects?status=partial&sort_by=stars&page_size=10"

# Sök efter React-projekt
curl "https://danielnylander.se/l10n-overview/api/projects?search=react"

# KDE-projekt med komplett svenska
curl "https://danielnylander.se/l10n-overview/api/projects?platform=kde&status=complete"
```

### Statistik
```http
GET /api/stats
```
Returnerar sammanfattande statistik för dashboard.

### Graf-data
```http
GET /api/charts  
```
Returnerar data för alla grafer (kvalitet, aktivitet, plattformar, kategorier).

### Filter-alternativ
```http
GET /api/categories  # Tillgängliga kategorier
GET /api/platforms   # Tillgängliga plattformar
```

### Utility
```http
GET /api/health      # Hälsokontroll
POST /api/refresh    # Tvinga datauppdatering
```

## 🗂️ Projektstruktur

```
l10n-overview/
├── index.html              # Huvudsida
├── style.css               # Styling
├── app.js                  # Huvudapplikation
├── charts.js              # Graf-funktionalitet  
├── data.js                 # Datahantering och mock data
├── README.md               # Denna fil
├── deploy.sh               # Deployment-skript
└── api/
    ├── collect.py          # Datainsamling från källor
    ├── server.py           # FastAPI backend
    ├── requirements.txt    # Python-dependencies
    └── data/
        └── projects.json   # Cachad projektdata
```

## ⚙️ Konfiguration

### Miljövariabler

```bash
# API-nycklar (valfria men rekommenderas för fullständig data)
export GITHUB_TOKEN="ghp_your_personal_access_token"
export WEBLATE_TOKEN="your_weblate_api_token"  
export CROWDIN_PERSONAL_TOKEN="your_crowdin_token"
export TRANSIFEX_TOKEN="your_transifex_api_token"

# API-inställningar
export API_PORT=8000
export DEBUG=false
export LOG_LEVEL=info
```

### GitHub Token
Skapa personal access token på https://github.com/settings/tokens
Krävs för att undvika rate limits och få bättre data.

### Weblate Token
Skapa på https://hosted.weblate.org/accounts/profile/#api
Ger tillgång till detaljerad översättningsstatistik.

## 🔧 Utveckling

### Lägg till ny datakälla

1. Skapa ny metod i `collect.py`:
```python
async def collect_new_platform_projects(self):
    """Samla projekt från ny plattform"""
    # Implementation här
```

2. Lägg till i `collect_all_data()`:
```python
tasks.append(self.collect_new_platform_projects())
```

3. Uppdatera kategorisering och kvalitetsuppskattning vid behov.

### Lägg till ny graf

1. Lägg till graf-container i `index.html`
2. Implementera graf-logik i `charts.js` 
3. Lägg till data-källan i `data.js` och `server.py`

### Anpassa styling
Alla CSS-variabler definieras i `:root` i `style.css` för enkel anpassning.

## 📈 Prestanda

### Caching
- Projektdata cachas i 1 timme
- Nginx cachas statiska filer i 1 år
- Gzip-komprimering för alla textfiler

### Rate Limiting
- GitHub API: Väntar mellan requests
- Weblate API: 0.1s delay mellan requests
- Background collection: Körs varje timme

### Optimering
- Lazy loading av projekt-rader
- Virtualiserad scrollning för stora listor
- Debounced search input
- Komprimerade bilder och minifierad CSS

## 🔒 Säkerhet

### SSL/TLS
- Let's Encrypt automatiska certifikat
- TLS 1.2+ endast
- HSTS headers
- Säkra cipher suites

### Headers
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff
- X-XSS-Protection aktiverad
- Referrer-Policy: strict-origin-when-cross-origin

### API
- CORS korrekt konfigurerad
- Input validering med Pydantic
- Rate limiting i produktion

## 🐛 Troubleshooting

### API startar inte
```bash
# Kontrollera logs
sudo journalctl -u l10n-overview -f

# Kontrollera port
sudo netstat -tulpn | grep 8000

# Manuell start för debugging
cd /var/www/l10n-overview.danielnylander.se/api
source ../venv/bin/activate
python server.py
```

### Data uppdateras inte
```bash
# Manuell datauppdatering
cd /var/www/l10n-overview.danielnylander.se/api
source ../venv/bin/activate
python collect.py

# Kontrollera cron
crontab -l

# Kontrollera API-nycklar
echo $GITHUB_TOKEN
```

### Frontend fungerar inte
```bash
# Kontrollera Nginx config
sudo nginx -t

# Reload Nginx
sudo systemctl reload nginx

# Kontrollera certifikat
sudo certbot certificates
```

## 📄 Licens

MIT License - se LICENSE-fil för detaljer.

## 🤝 Bidrag

Välkomna! Skapa issue eller pull request.

### Bidra med översättningsdata
- Lägg till ny platform i `collect.py`
- Förbättra kvalitetsalgoritm
- Lägg till fler projekt-kategorier

### Förbättra frontend  
- Lägg till fler filter
- Förbättra UX/UI
- Optimera prestanda

## 📞 Support

- **GitHub Issues:** https://github.com/yeager/l10n-overview/issues
- **E-post:** daniel@danielnylander.se
- **Website:** https://danielnylander.se

---

**🌟 L10n Overview hjälper svenska open source-översättare att hitta projekt som behöver hjälp!**