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
