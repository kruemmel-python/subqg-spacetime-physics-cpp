# Doppelpulsar: starke Gravitation und Quadrupolstrahlung

## Datensatz

Der Doppelpulsar PSR J0737-3039A/B besitzt zwei stark selbstgravitierende
Neutronensterne in einer `2,45 h`-Bahn. Kramer et al. werteten 16 Jahre
Pulsartiming aus und bestimmten sieben post-keplersche Parameter.

Verwendete publizierte Eingaben:

- `m_A = 1,338185 M_sun`;
- `m_B = 1,248868 M_sun`;
- `P_b = 0,1022515592973 d`;
- `e = 0,087777023`.

Es wird kein Parameter an die gemessene Bahnabnahme angepasst.

## Führende Spin-2-Quadrupolvorhersage

Für eine masselose Spin-2-Theorie mit universeller, durch die Newton-Grenze
normalisierter Quellenkopplung lautet die Peters-Mathews-Vorhersage

```text
Pdot_b = -(192*pi/5) (T_sun*n_b)^(5/3)
         * m_A*m_B/(m_A+m_B)^(1/3)
         * (1 + 73 e²/24 + 37 e⁴/96)/(1-e²)^(7/2).
```

Die Bibliothek berechnet daraus
`Pdot_b = -1,247810378e-12`. Die Veröffentlichung gibt für den führenden
2,5PN-Term `-1,247810e-12` an. Die relative Differenz beträgt nur ungefähr
`3,03e-7` und entsteht aus den gerundeten Tabelleneingaben.

Die gemessene, von externen Effekten und dem Spin-down-Massenverlust
bereinigte GW-Bahnabnahme ist `-1,247782(79)e-12`. Die führende
Quadrupolvorhersage liegt `0,359 Sigma` vom Messwert entfernt.

## Vollständige relativistische Closure

Unter Einschluss des publizierten 3,5PN-Terms lautet der beobachtete Quotient

```text
Pdot_b(observed)/Pdot_b(GR) = 0,999963 ± 0,000063.
```

Eine vollständige Einstein-Spin-2-Closure sagt den Quotienten eins voraus und
liegt `0,587 Sigma` vom Messzentrum entfernt.

## Offene Brücke

Dies ist ein starker **bedingter empirischer Treffer**, aber noch kein
vollständiger Mikro-Nachweis:

- Der SubQG-IR-Sektor besitzt zwei TT-Polarisationen und masselose Dispersion.
- Die führende Quadrupolformel folgt nach universeller Spin-2-
  Quellenkopplung und Newton-Normalisierung.
- Die verankerte kanonische Mikrowirkung ist jedoch skalar und gegappt.
- Ihre universelle Quellenkopplung, nichtlineare starke-Feld-Completion und
  Strahlungsrückwirkung sind noch nicht auf den Spin-2-Sektor gematcht.

Der Test bestätigt daher die konstruierte IR-Closure; er darf die offene
Mikro-zu-IR-Herleitung nicht ersetzen.

## Reproduktion

```powershell
npm run validation:binary-pulsar
```

Ergebnisdatei: `validation/results/binary_pulsar_validation.json`

SHA-256: `431C037B76085CE83E323DF60DAA313989533B2F0F60F975241DCBF267258F41`.
Zwei unmittelbar aufeinanderfolgende Läufe erzeugten byteidentische Dateien.

Quelle: Kramer et al., [arXiv:2112.06795](https://arxiv.org/abs/2112.06795),
DOI `10.1103/PhysRevX.11.041050`.
