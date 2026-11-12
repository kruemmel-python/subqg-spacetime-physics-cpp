# Direkte Gravitationswellen-Validierung

## Eingefrorene Vorhersage

Der bereits konstruierte lineare SubQG-IR-Sektor ist eine masselose
Fierz-Pauli-Spin-2-Theorie. Vor Betrachtung der Messwerte sind damit

```text
omega² = c² |k|²,
(v_g - c)/c = 0,
m_g = 0,
Polarisationen = plus, cross (transversal-spurfrei)
```

festgelegt. Für diesen Test wird kein Parameter gefittet.

## Vergleich mit direkten Beobachtungen

| Observable | SubQG-IR-Vorhersage | Beobachtung | Ergebnis |
|---|---:|---:|---|
| GW-Geschwindigkeit | `delta v/c = 0` | GW170817/GRB 170817A: `-3e-15 <= delta v/c <= +7e-16` | kompatibel |
| Dispersion/Masse | `m_g = 0` | GWTC-3: `m_g <= 1,27e-23 eV/c²` (90 %) | kompatibel |
| Dispersion/Masse | `m_g = 0` | GWTC-4.0: `m_g <= 1,92e-23 eV/c²` (90 %) | kompatibel |
| Polarisation | genau zwei Tensor-TT-Moden | GW170814: Tensor gegenüber reinem Vektor `>200`, gegenüber reinem Skalar `>1000`; GWTC-4.0 findet in 91 sicheren Ereignissen keine Evidenz für Nicht-Tensor-Moden | kompatibel |

Die GWTC-4.0-Massengrenze ist numerisch schwächer als die GWTC-3-Grenze und
wird deshalb nicht als Verbesserung bezeichnet. Ein einseitiges oberes Limit
ist keine um null zentrierte Messung; für die Massenvergleiche wird daher kein
erfundener Sigma-Abstand angegeben.

Der GW170814-Vergleich unterscheidet reine Tensor-, Vektor- und
Skalarhypothesen. Er schließt nicht automatisch jede beliebig kleine
Mischpolarisation aus. Ebenso bedeutet „keine Evidenz“ in GWTC-4.0 nicht den
logischen Beweis, dass exakt keine zusätzliche Mode existiert.

## Aussagekraft und offene Brücke

Alle drei direkt zugänglichen Vorhersageklassen des konstruierten IR-Sektors
— Geschwindigkeit, masselose Dispersion und Tensorpolarisation — bestehen die
gegenwärtigen Beobachtungsgrenzen. Zusammen mit der Doppelpulsar-Dämpfung ist
damit die **beobachtbare masselose Spin-2-Closure** stark bestätigt.

Noch offen ist ein anderer mathematischer Satz: Aus der verankerten skalaren
kanonischen SubQG-Mikrowirkung muss der universell normalisierte masselose
Spin-2-Quellsektor abgeleitet werden. Solange diese Mikro-zu-IR-Brücke fehlt,
ist der direkte Test ein empirischer Nachweis der konstruierten
SubQG-IR-Gravitation, aber noch kein vollständiger Identitätsbeweis der
fundamentalen Mikrowirkung mit der Gravitation unseres Universums.

## Reproduktion

```powershell
npm run validation:gravitational-waves
```

Ergebnisdatei: `validation/results/gravitational_wave_validation.json`.

SHA-256: `1A41C4E5FCC5EBF17D19384DFAE7C1685EE239027BF934971592E8E5EBDD0789`.
Zwei unmittelbar aufeinanderfolgende Läufe erzeugten byteidentische Dateien.

Primärquellen:

- GW170817/GRB 170817A: [arXiv:1710.05834](https://arxiv.org/abs/1710.05834)
- GWTC-3: [arXiv:2112.06861](https://arxiv.org/abs/2112.06861)
- GWTC-4.0 parametrisierte Tests: [arXiv:2603.19020](https://arxiv.org/abs/2603.19020)
- GWTC-4.0 Übersicht/Polarisation: [arXiv:2603.19019](https://arxiv.org/abs/2603.19019)
- GW170814: DOI `10.1103/PhysRevLett.119.141101`
