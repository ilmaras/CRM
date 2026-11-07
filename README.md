# Mini CRM

Klaipėdos universiteto naudotojo sąsajų technologijų trečiasis laboratorinis darbas. „Angular“ programoje įgyvendinta įmonės duomenų forma su validacija ir dinaminiu kontaktinių asmenų sąrašu.

## L03.1 etapas

Pradiniame įmonių sąrašo ekrane „+“ atveria naujos įmonės formą. Joje galima įvesti įmonės rekvizitus, pridėti, redaguoti ir pašalinti kontaktinius asmenis. Įmonė gali neturėti kontaktų arba turėti kelis.

„Išsaugoti“ aktyvus tik tada, kai duomenys tinkami ir nėra nebaigto kontakto pridėjimo ar redagavimo. Paspaudus mygtuką, įmonės ir kontaktų duomenys pateikiami naršyklės konsolėje. Tikras saugojimas šiame etape neįgyvendintas, todėl įmonių sąrašas lieka tuščias, o išėjus iš formos jos duomenys prarandami.

## Veiksmų seka

[Supaprastinta programos veiksmų diagrama](diagrams/flow.svg) · [„Mermaid“ šaltinis](diagrams/flow.mmd)

Diagrama rodo pagrindinę eigą nuo įmonių sąrašo iki duomenų pateikimo konsolėje. Redagavimo, šalinimo ir atšaukimo šakos joje nedetalizuojamos.

## Paleidimas

Projektas paruoštas su „Node.js“ 24.21.0, `npm` 11.19.0 ir „Angular CLI“ 22.1.8. Projekto aplanke vykdykite:

```bash
npm install
npm start
```

Naršyklėje atverkite <http://localhost:4200/>. Formos pateiktus duomenis peržiūrėkite naršyklės kūrėjo įrankių konsolėje.

## Papildymai ir priimti sprendimai

- Kontaktiniam asmeniui pridėtas el. paštas. Vardas, pavardė, el. paštas ir telefonas privalomi, pareigos – neprivalomos.
- Telefonui priimami `+370` ir 8 skaitmenys arba `0` ir 8 skaitmenys. Vietinis formatas papildo užduotyje nurodytą 10–12 simbolių ilgį.
- Įmonės kodui tikrinami 7 arba 9 skaitmenys, PVM kodui – 9 arba 12 skaitmenų su neprivalomu `LT` prefiksu. Tikrinamas formatas ir ilgis, o ne kontrolinis skaitmuo ar registracijos egzistavimas.

Kodų ilgiai parinkti pagal [Registrų centro instrukciją](https://www.registrucentras.lt/Carol_Fup/help/FOLLOW_UP_HELP_T_2020.pdf) ir [VMI specifikaciją](https://www.vmi.lt/evmi/documents/20142/1032511/PVM%2Bgr%C4%85%C5%BEinimo%2Bkeleiviams%2Bmain%C5%B3%2Bsu%2Bprekybininkais%2Bspecifikacija%2Bv2.0.pdf/12ce6a05-44be-c5cd-ba54-d7f98f78f146?t=1693986862499).

## Patikra

```bash
npm run build
npm test -- --watch=false
```

© 2026 Ilmaras Tarikas · Klaipėdos universitetas, JMNTS25.
