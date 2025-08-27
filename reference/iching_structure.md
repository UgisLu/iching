# I Ching Interpretācijas Struktūras Specifikācija

## 1. Pirmā heksagramma (Esošā situācija)
- **number**: Heksagrammas numurs (32)  
- **name**: Nosaukums vairākās valodās (Héng / Ilgums / Duration)  
- **symbol**: Ķīniešu rakstzīme (恆)  
- **lines**: Līniju secība (piemēram, `[0, 1, 1, 1, 0, 0]` — 1 = yang, 0 = yin)  
- **trigrams**: Augšējais un apakšējais trigrams (Thunder + Wind)  
- **element**: Saistītais elements (Koks)  
- **keywords**: Atslēgvārdi (Pastāvība, Harmonija, Miers)  
- **generalMeaning**: Vispārējā interpretācija (“Ilgums nāk no stabilitātes...”)  
- **advice**: Ieteikumi (“Sekojiet pastāvīgajam”)  
- **changingLines** *(ja ir)*:  
  - 1: “Bez stabilitātes nekas nevar pastāvēt”  
  - … (citātu vai īsu interpretāciju saraksts)

## 2. Otrā heksagramma (Jaunā situācija pēc pārmaiņām)
- **number**: Heksagrammas numurs (jaunā)  
- **name**: Nosaukums (jaunā)  
- **symbol**: Ķīniešu rakstzīme (jaunā)  
- **transformationMeaning**: Kā mainās situācija (“No ilguma uz kustību”)  
- **futureAdvice**: Ko darīt tālāk? (“Pielāgojieties pārmaiņām”)

## 3. Kopīgais Filosofiskais Slānis
- **classicalText**: Citāts no I Ching vai daoism teksta (“Tas, kurš saglabā pastāvību...”)  
- **metaphor**: Metaforiskas ilustrācijas (“Kā upes straume...”)  
- **selfReflectionQuestion**: Pārdomu rosinošs jautājums (“Vai esmu pacietīgs?”)

---

##  Ķīniešu Tradīcijas Svarīgie Princips
1. **Lasīšana no apakšas uz augšu**:  
   - 1.–3. līnijas = Zemes sfēra (praksts, zemais)  
   - 4.–6. līnijas = Debesu sfēra (garīgais, augstais)

2. **Ben gua (pirmā heksagramma)**: sākotnējā situācija, karmiskie modeļi, enerģijas plūsma.

3. **Zhi gua (otra heksagramma)**: nākotnes virziens, transformācija, Dao saskaņā.

4. **Rituaļi un simbolisms**:  
   - Monētu metode: **trīs metieni** katrai līnijai → harmonija laika un telpas kontekstā.  
   - Stiebru metode: 50 vītoli kreisajā plaukstā, skaitīt līdz 9, simbolizējot laika ritumu.  
   - Trigrami sasaistās ar dabas elementiem un ķermeņa daļām (Feng Shui perspektīva).

5. **Lietotāja Saskarne (UX) Vadlīnijas**:  
   - **Krāsu kods**: Yang = sarkans, Yin = melns; mainīgas līnijas = dzeltens.  
   - **Animācija**: heksagrammu attēlošana no apakšas uz augšu.  
   - **Filozofiskie slāņi**: strukturēt sadaļas — interpretācija → ieteikumi → pašrefleksija.

6. **Tabu un etiķete**:  
   - **Nekad nevaicāto pašu jautājumu** atkārtoti — orākula apvainošanas risks.  
   - Risinājums: “Ja vēlies precizēt, pārformulējiet jautājumu.”

---

**Norāde**: Šis fails kalpo kā dokuments/specifikācija struktūrai, ko izmantot konsoles un rīka frontend/back-end izstrādē. Tas nodrošina, ka dati ir konsekventi un uztur ievērot I Ching tradīciju.

---
