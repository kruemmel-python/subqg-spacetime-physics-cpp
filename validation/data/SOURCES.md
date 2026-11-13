# Externe empirische Datenquellen

## SPARC

- Herausgeber: Federico Lelli, Stacy McGaugh und James Schombert
- Projektseite: <https://astroweb.cwru.edu/SPARC/>
- Primärpublikation: Lelli, McGaugh & Schombert, *AJ* 152, 157 (2016),
  DOI `10.3847/0004-6256/152/6/157`
- Datei: `Rotmod_LTG.zip`
- Direkte Quelle: <https://astroweb.cwru.edu/SPARC/Rotmod_LTG.zip>
- SHA-256:
  `0A80CC90714828CC28B7DD57923576714D209F2490328C087C4A4AD607FAF588`
- Inhalt bei der abgerufenen Version: 175 Rotationskurven-Dateien

Zusätzliche RAR-Daten:

- Datei: `RAR.mrt`
- Direkte Quelle: <https://astroweb.cwru.edu/SPARC/RAR.mrt>
- SHA-256:
  `24AA7059DAB7FA44787F7C11191052489899819370F6508621674769F3B72833`

Galaxien-Metadaten für den hierarchischen Likelihood-Test:

- Datei: `SPARC_Lelli2016c.mrt` (175 Galaxien; `D`, `e_D`, `Inc`, `e_Inc`,
  Qualitätsflag)
- archivierter Primärdatensatz: <https://doi.org/10.5281/zenodo.16284118>
- SHA-256:
  `5AA0501F6B0D881FA579030E315E7B5B6EF561A5BD3A07472F9929C7E5728243`
- Nuisance-Transformationen und Priors: Li et al., *A&A* 615, A3 (2018),
  <https://arxiv.org/abs/1803.00022>: Gauß-Priors für Distanz und Inklination,
  lognormale M/L-Priors um 0,5 beziehungsweise 0,7 mit 0,1 dex Streuung.

Die Daten sind externe wissenschaftliche Primärdaten. Bei Veröffentlichungen
müssen die SPARC-Masterpublikation und gegebenenfalls die in `Table1.mrt`
aufgeführten ursprünglichen Rotationskurvenquellen zitiert werden.

## LITTLE THINGS

- Herausgeber des Katalogs: Se-Heon Oh et al.
- VizieR-Katalog: `J/AJ/149/180`
- Katalogseite: <https://vizier.cds.unistra.fr/viz-bin/VizieR?-source=J/AJ/149/180>
- Primärpublikation: Oh et al., *AJ* 149, 180 (2015),
  DOI `10.1088/0004-6256/149/6/180`
- Preprint: <https://arxiv.org/abs/1502.01281>
- Tabelle `rotdmbar`: gemessene Gesamtrotationskurven sowie Modelle
- Tabelle `rotdm`: nach Abzug des baryonischen Massenmodells bestimmte
  Dunkle-Materie-Rotationskurven sowie Modelle
- verwendeter VizieR-Spiegel:
  <https://vizier.cfa.harvard.edu/viz-bin/asu-tsv>
- normalisierter wissenschaftlicher SHA-256 von `rotdmbar`:
  `50DC8DBA05E819F2744A5E9F9240C4B112DB686068653B1CC7D1CD7B350C18CE`
- normalisierter wissenschaftlicher SHA-256 von `rotdm`:
  `3C6604FA8CB75CDD3B7465A7BDAE6BB6042D187EE64DAC062CCE1A8CBBBC9702`

Die normalisierten Hashes umfassen Spaltenkopf und alle Tabellenzeilen, aber
nicht die bei jedem Abruf wechselnden VizieR-Zeitstempel. Der Abrufprüfer
kontrolliert zusätzlich Schema, 1.716 beziehungsweise 1.485 Tabellenzeilen
und 26 beziehungsweise 22 Galaxien.

## Starke Galaxienlinsen und PPN-`gamma`

- Primärpublikation: Cao et al., *ApJ* 835, 92 (2017)
- DOI: `10.3847/1538-4357/835/1/92`
- Preprint: <https://arxiv.org/abs/1701.00357>
- Beobachtete Stichprobe: 80 massenselektierte Linsen aus SLACS, BELLS, LSD
  und SL2S
- veröffentlichter Wert bei festen fiduzialen Galaxienstrukturparametern:
  `gamma = 0.995 +0.037/-0.047` bei 68 % Konfidenz
- veröffentlichte 68-%-Spanne unter Einbeziehung untersuchter
  Struktur-Systematiken: ungefähr `0.845` bis `1.240`

Die aktuelle Pipeline verwendet nur diese publizierten Posteriorangaben und
behauptet keinen Refit der Bildpixel oder des ursprünglichen Linsenkatalogs.
Ein späterer radienaufgelöster Rohdatentest muss dieses Aggregat-Gate ersetzen.

## Planetare Ephemeriden

- Primärpublikation: Fienga et al., *Celestial Mechanics and Dynamical
  Astronomy* 111, 363–385 (2011)
- DOI: `10.1007/s10569-011-9377-8`
- Preprint: <https://arxiv.org/abs/1108.5546>
- verwendete Daten: INPOP10a Tabelle 5, zusätzliche Perihelraten von Merkur,
  Venus, Erde-Mond-Baryzentrum, Mars, Jupiter und Saturn
- Methode der Quelle: gleichzeitige Fits von Anfangsbedingungen, solarem `GM`
  und Asteroidenmassen; angegebene Intervalle verschlechtern die
  INPOP10a-Postfit-Residuen um weniger als fünf Prozent

Bahnelemente:

- Herausgeber: NASA/JPL Solar System Dynamics
- Tabelle: <https://ssd.jpl.nasa.gov/planets/approx_pos.html>
- verwendete Spalten: J2000-Halbachse und Exzentrizität, Tabelle für
  1800–2050

Unabhängige Ephemeriden-Replikation:

- Primärpublikation: Pitjeva & Pitjev, *Astronomy Letters* 39 (2013)
- Preprint: <https://arxiv.org/abs/1306.3043>
- verwendete Daten: EPM2011 Tabelle 4, zusätzliche Perihelraten aus ungefähr
  678.000 Beobachtungen von Planeten und Raumfahrzeugen
- Einheitenumrechnung: `mas/Jahr * 100 = mas/Jahrhundert`

## Lokale Gravitation

Äquivalenzprinzip:

- Primärpublikation: Touboul et al., *Classical and Quantum Gravity* 39,
  204009 (2022)
- Preprint: <https://arxiv.org/abs/2209.15487>
- verwendeter Endwert:
  `eta(Ti,Pt) = [-1.5 ± 2.3 (stat) ± 1.5 (syst)] * 10^-15`
- Testkörper: Pt/Rh(90/10) und Ti/Al/V(90/6/4)
- verwendete mittlere Umlauffrequenz: `0.16818 mHz`
- geozentrische Gravitationskonstante und mittlere Äquatorgravitation:
  IERS Conventions, Tabelle 1.1,
  <https://iers-conventions.obspm.fr/conventions/content/tn36.pdf>

Inverses Quadratgesetz:

- Primärpublikation: Lee et al., *Physical Review Letters* 124, 101101
  (2020)
- Preprint: <https://arxiv.org/abs/2002.11761>
- Messbereich: `52 µm` bis `3.0 mm`
- veröffentlichte Grenze: Yukawa-Kopplung mit `alpha=1` hat bei 95 %
  Konfidenz eine Reichweite kleiner als `38.6 µm`
- Die aktuelle Prüfung verwendet den publizierten Nullbefund; sie ist noch
  kein Refit der 95 Torsionsmessungen und 17 Apparateparameter.

## Doppelpulsar

- Primärpublikation: Kramer et al., *Physical Review X* 11, 041050 (2021)
- DOI: `10.1103/PhysRevX.11.041050`
- Preprint: <https://arxiv.org/abs/2112.06795>
- System: PSR J0737-3039A/B, 16 Jahre Timing
- verwendete Tabellenwerte: `P_b`, `e_T`, `m_A`, `m_B`
- verwendete Vergleichswerte: Gleichungen 44, 45 und 48 für gemessene
  GW-Bahnabnahme, führende 2,5PN-Vorhersage und vollständigen GR-Quotienten

## Direkte Gravitationswellen

- GW170817/GRB 170817A, Laufzeitdifferenz und GW-Geschwindigkeit:
  <https://arxiv.org/abs/1710.05834>
- GWTC-3, Dispersions- und Gravitonenmassentest:
  <https://arxiv.org/abs/2112.06861>
- GWTC-4.0, parametrisierte Tests und Gravitonenmassengrenze:
  <https://arxiv.org/abs/2603.19020>
- GWTC-4.0, Katalogübersicht und Polarisationstests:
  <https://arxiv.org/abs/2603.19019>
- GW170814, Drei-Detektor-Polarisationstest:
  DOI `10.1103/PhysRevLett.119.141101`,
  <https://dcc.ligo.org/public/0145/P170814/015/LIGO-P170814.pdf>
