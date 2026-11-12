/*
 * Fragen bearbeiten und ergänzen:
 * [id, kategorie, schwierigkeit, frage, [vier Antworten], richtigeAntwort(0-3), erklärung]
 *
 * Kategorien können selbst hinzugefügt werden, sobald pro Kategorie
 * mindestens fünf Fragen für "easy", "medium" und "hard" vorhanden sind.
 * WICHTIG: Einmal verwendete IDs nicht ändern, damit Speicherstände passen.
 */
const QUESTION_ROWS = [
  // ALLGEMEINWISSEN - LEICHT
  ["all-e-01","Allgemeinwissen","easy","Wie viele Tage hat eine Woche?",["5","6","7","8"],2,"Eine Woche besteht aus sieben Tagen."],
  ["all-e-02","Allgemeinwissen","easy","Welche Farbe entsteht beim Mischen von blauer und gelber Malfarbe?",["Grün","Orange","Lila","Rot"],0,"Blau und Gelb ergeben bei Malfarben Grün."],
  ["all-e-03","Allgemeinwissen","easy","Wie viele Minuten hat eine Stunde?",["30","45","90","60"],3,"Eine Stunde entspricht 60 Minuten."],
  ["all-e-04","Allgemeinwissen","easy","Welches Instrument hat in der Standardausführung 88 Tasten?",["Geige","Klavier","Trompete","Gitarre"],1,"Ein modernes Standardklavier hat 88 Tasten."],
  ["all-e-05","Allgemeinwissen","easy","Welcher Monat folgt auf April?",["Juni","März","Mai","Juli"],2,"Auf April folgt der Mai."],
  // ALLGEMEINWISSEN - MITTEL
  ["all-m-01","Allgemeinwissen","medium","In welcher Einheit wird elektrischer Widerstand gemessen?",["Volt","Watt","Ohm","Ampere"],2,"Die Einheit des elektrischen Widerstands ist Ohm."],
  ["all-m-02","Allgemeinwissen","medium","Welches chemische Symbol steht für Gold?",["Ag","Au","Gd","Go"],1,"Au leitet sich vom lateinischen Wort aurum ab."],
  ["all-m-03","Allgemeinwissen","medium","Welchem Wert entspricht die römische Zahl XL?",["40","60","90","110"],0,"X vor L bedeutet 50 minus 10, also 40."],
  ["all-m-04","Allgemeinwissen","medium","In welchem Jahr fiel die Berliner Mauer?",["1987","1991","1979","1989"],3,"Die Berliner Mauer wurde am 9. November 1989 geöffnet."],
  ["all-m-05","Allgemeinwissen","medium","In welchem Roman tritt die Erzählerfigur Ismael auf?",["Der Prozess","Moby-Dick","1984","Der kleine Prinz"],1,"Ismael erzählt in Herman Melvilles Roman Moby-Dick."],
  // ALLGEMEINWISSEN - SCHWER
  ["all-h-01","Allgemeinwissen","hard","Wie heißt die SI-Basiseinheit der Lichtstärke?",["Lux","Lumen","Candela","Weber"],2,"Die Lichtstärke wird in Candela gemessen."],
  ["all-h-02","Allgemeinwissen","hard","Wer verfasste die 'Kritik der reinen Vernunft'?",["Georg Hegel","Immanuel Kant","Friedrich Nietzsche","Arthur Schopenhauer"],1,"Immanuel Kant veröffentlichte das Werk 1781."],
  ["all-h-03","Allgemeinwissen","hard","Wer formulierte die berühmten Unvollständigkeitssätze?",["Kurt Gödel","Carl Friedrich Gauß","Leonhard Euler","Alan Turing"],0,"Kurt Gödel veröffentlichte sie 1931."],
  ["all-h-04","Allgemeinwissen","hard","Welches Edelgas besitzt die Ordnungszahl 54?",["Argon","Neon","Krypton","Xenon"],3,"Xenon hat die Ordnungszahl 54."],
  ["all-h-05","Allgemeinwissen","hard","Wer prägte den Begriff 'Entropie' in der Thermodynamik?",["Max Planck","Rudolf Clausius","Niels Bohr","James Joule"],1,"Rudolf Clausius führte den Begriff 1865 ein."],

  // GEOGRAFIE - LEICHT
  ["geo-e-01","Geografie","easy","Was ist die Hauptstadt von Frankreich?",["Madrid","Paris","Rom","Wien"],1,"Paris ist die Hauptstadt Frankreichs."],
  ["geo-e-02","Geografie","easy","Auf welchem Kontinent liegt Brasilien?",["Europa","Asien","Afrika","Südamerika"],3,"Brasilien liegt in Südamerika."],
  ["geo-e-03","Geografie","easy","Welcher Ozean ist flächenmäßig der größte?",["Pazifischer Ozean","Atlantischer Ozean","Indischer Ozean","Arktischer Ozean"],0,"Der Pazifik ist der größte Ozean der Erde."],
  ["geo-e-04","Geografie","easy","In welchem Land liegt Rom?",["Griechenland","Spanien","Italien","Portugal"],2,"Rom ist die Hauptstadt Italiens."],
  ["geo-e-05","Geografie","easy","Welche Himmelsrichtung liegt dem Osten gegenüber?",["Norden","Westen","Süden","Nordosten"],1,"Westen ist die Gegenrichtung zu Osten."],
  // GEOGRAFIE - MITTEL
  ["geo-m-01","Geografie","medium","Was ist die Hauptstadt von Kanada?",["Toronto","Vancouver","Ottawa","Montreal"],2,"Ottawa ist die Hauptstadt Kanadas."],
  ["geo-m-02","Geografie","medium","Wie heißt die große Wüste im Norden Afrikas?",["Sahara","Gobi","Kalahari","Atacama"],0,"Die Sahara erstreckt sich über weite Teile Nordafrikas."],
  ["geo-m-03","Geografie","medium","Welche Stadt liegt am Bosporus?",["Athen","Ankara","Izmir","Istanbul"],3,"Der Bosporus verläuft durch Istanbul."],
  ["geo-m-04","Geografie","medium","Welcher Berg ist der höchste Afrikas?",["Mount Kenya","Kilimandscharo","Atlas","Ras Daschän"],1,"Der Kilimandscharo erreicht etwa 5.895 Meter."],
  ["geo-m-05","Geografie","medium","Welche Meerenge liegt zwischen Spanien und Marokko?",["Bosporus","Straße von Hormus","Straße von Gibraltar","Beringstraße"],2,"Sie verbindet Atlantik und Mittelmeer."],
  // GEOGRAFIE - SCHWER
  ["geo-h-01","Geografie","hard","Welches Land grenzt sowohl an das Kaspische Meer als auch an den Persischen Golf?",["Iran","Aserbaidschan","Irak","Kasachstan"],0,"Iran hat Küsten an beiden Gewässern."],
  ["geo-h-02","Geografie","hard","Welcher See gilt als der tiefste der Erde?",["Tanganjikasee","Baikalsee","Kaspisches Meer","Titicacasee"],1,"Der Baikalsee erreicht rund 1.642 Meter Tiefe."],
  ["geo-h-03","Geografie","hard","Welches Land hat die Hauptstadt Thimphu?",["Nepal","Laos","Mongolei","Bhutan"],3,"Thimphu ist die Hauptstadt Bhutans."],
  ["geo-h-04","Geografie","hard","In welchem Land liegt der Vulkan Cotopaxi?",["Peru","Chile","Ecuador","Kolumbien"],2,"Cotopaxi ist ein Vulkan in Ecuador."],
  ["geo-h-05","Geografie","hard","Welche Meerenge verbindet das Rote Meer mit dem Golf von Aden?",["Bab al-Mandab","Straße von Malakka","Dardanellen","Straße von Messina"],0,"Bab al-Mandab liegt am südlichen Ausgang des Roten Meeres."],
  // NATUR & WISSENSCHAFT - LEICHT
  ["nat-e-01","Natur & Wissenschaft","easy","Wie viele Beine hat ein Insekt?",["4","6","8","10"],1,"Insekten besitzen drei Beinpaare, also sechs Beine."],
  ["nat-e-02","Natur & Wissenschaft","easy","Was bezeichnet die Formel H2O?",["Kohlenstoffdioxid","Sauerstoff","Salz","Wasser"],3,"H2O ist die chemische Formel von Wasser."],
  ["nat-e-03","Natur & Wissenschaft","easy","Welcher Planet ist der Sonne am nächsten?",["Merkur","Venus","Erde","Mars"],0,"Merkur ist der innerste Planet des Sonnensystems."],
  ["nat-e-04","Natur & Wissenschaft","easy","Welches Organ pumpt Blut durch den menschlichen Körper?",["Lunge","Leber","Herz","Magen"],2,"Das Herz treibt den Blutkreislauf an."],
  ["nat-e-05","Natur & Wissenschaft","easy","Welches Gas braucht der Mensch für die Zellatmung?",["Helium","Sauerstoff","Stickstoff","Argon"],1,"Bei der Zellatmung wird Sauerstoff benötigt."],
  // NATUR & WISSENSCHAFT - MITTEL
  ["nat-m-01","Natur & Wissenschaft","medium","Wofür steht DNA auf Deutsch?",["Dynamische Nuklearanalyse","Doppelte Nervenzellachse","Desoxyribonukleinsäure","Digitale Nukleinsäure"],2,"DNA steht für Desoxyribonukleinsäure."],
  ["nat-m-02","Natur & Wissenschaft","medium","Welcher Planet hat den größten Durchmesser in unserem Sonnensystem?",["Jupiter","Saturn","Neptun","Uranus"],0,"Jupiter ist der größte Planet des Sonnensystems."],
  ["nat-m-03","Natur & Wissenschaft","medium","Welche Teilchen sind negativ elektrisch geladen?",["Protonen","Neutronen","Photonen","Elektronen"],3,"Elektronen tragen eine negative Elementarladung."],
  ["nat-m-04","Natur & Wissenschaft","medium","Wie heißt die Umwandlung von Lichtenergie in chemische Energie bei Pflanzen?",["Gärung","Photosynthese","Verdunstung","Osmose"],1,"Bei der Photosynthese wird Lichtenergie chemisch gespeichert."],
  ["nat-m-05","Natur & Wissenschaft","medium","Wie viele Chromosomen besitzt eine typische menschliche Körperzelle?",["23","44","46","48"],2,"Die meisten Körperzellen besitzen 23 Chromosomenpaare."],
  // NATUR & WISSENSCHAFT - SCHWER
  ["nat-h-01","Natur & Wissenschaft","hard","Welches chemische Element hat die Ordnungszahl 74?",["Wolfram","Molybdän","Tantal","Osmium"],0,"Wolfram (W) hat die Ordnungszahl 74."],
  ["nat-h-02","Natur & Wissenschaft","hard","Wie heißt die Grenze eines Schwarzen Lochs, hinter der kein Licht entkommen kann?",["Photosphäre","Magnetopause","Akkretionsscheibe","Ereignishorizont"],3,"Der Ereignishorizont markiert diese Grenze."],
  ["nat-h-03","Natur & Wissenschaft","hard","Welches Kohlenstoffisotop wird zur Radiokarbondatierung verwendet?",["Kohlenstoff-12","Kohlenstoff-14","Kohlenstoff-13","Kohlenstoff-11"],1,"Die C14-Methode nutzt den Zerfall von Kohlenstoff-14."],
  ["nat-h-04","Natur & Wissenschaft","hard","In welchem Zellorganell entsteht bei Eukaryoten der größte Teil des ATP durch Zellatmung?",["Zellkern","Golgi-Apparat","Mitochondrium","Ribosom"],2,"Die oxidative Phosphorylierung findet in Mitochondrien statt."],
  ["nat-h-05","Natur & Wissenschaft","hard","Welche Größenordnung hat die Avogadro-Konstante pro Mol?",["6,02 x 10^23","6,02 x 10^12","3,00 x 10^8","1,60 x 10^-19"],0,"Sie beträgt etwa 6,022 x 10^23 mol^-1."],

  // GESCHICHTE - LEICHT
  ["his-e-01","Geschichte","easy","Wer betrat 1969 als erster Mensch den Mond?",["Juri Gagarin","Buzz Aldrin","Neil Armstrong","John Glenn"],2,"Neil Armstrong betrat im Juli 1969 als erster Mensch den Mond."],
  ["his-e-02","Geschichte","easy","In welchem Land stehen die Pyramiden von Gizeh?",["Griechenland","Ägypten","Mexiko","Indien"],1,"Die Pyramiden von Gizeh befinden sich in Ägypten."],
  ["his-e-03","Geschichte","easy","Welche Königin prägte das britische 19. Jahrhundert?",["Elisabeth I.","Anne","Maria I.","Victoria"],3,"Victoria regierte von 1837 bis 1901."],
  ["his-e-04","Geschichte","easy","Welcher Krieg endete in Europa 1945?",["Zweiter Weltkrieg","Erster Weltkrieg","Dreißigjähriger Krieg","Krimkrieg"],0,"In Europa endete der Zweite Weltkrieg im Mai 1945."],
  ["his-e-05","Geschichte","easy","Welches antike Reich hatte Rom als Zentrum?",["Osmanisches Reich","Persisches Reich","Römisches Reich","Mongolisches Reich"],2,"Rom war das Zentrum des Römischen Reiches."],
  // GESCHICHTE - MITTEL
  ["his-m-01","Geschichte","medium","In welchem Jahr begann die Französische Revolution?",["1776","1789","1815","1848"],1,"1789 gilt als Beginn der Französischen Revolution."],
  ["his-m-02","Geschichte","medium","Wer war der erste Bundeskanzler der Bundesrepublik Deutschland?",["Willy Brandt","Ludwig Erhard","Helmut Kohl","Konrad Adenauer"],3,"Konrad Adenauer wurde 1949 zum Bundeskanzler gewählt."],
  ["his-m-03","Geschichte","medium","Welches Bauwerk teilte Berlin von 1961 bis 1989?",["Berliner Mauer","Brandenburger Tor","Reichstag","Siegessäule"],0,"Die Berliner Mauer wurde ab August 1961 errichtet."],
  ["his-m-04","Geschichte","medium","In welcher Stadt wurde 1919 der Friedensvertrag mit Deutschland unterzeichnet?",["Genf","Paris","Versailles","Brüssel"],2,"Er wurde im Schloss Versailles unterzeichnet."],
  ["his-m-05","Geschichte","medium","Welcher Seefahrer erreichte 1492 die Karibik?",["Ferdinand Magellan","Christoph Kolumbus","James Cook","Vasco da Gama"],1,"Kolumbus erreichte 1492 Inseln der Karibik."],
  // GESCHICHTE - SCHWER
  ["his-h-01","Geschichte","hard","Welcher Frieden beendete 1648 den Dreißigjährigen Krieg?",["Westfälischer Friede","Frieden von Utrecht","Frieden von Tilsit","Prager Frieden"],0,"Der Westfälische Friede wurde 1648 geschlossen."],
  ["his-h-02","Geschichte","hard","Unter welchem byzantinischen Kaiser wurde die Hagia Sophia im 6. Jahrhundert erbaut?",["Konstantin I.","Herakleios","Justinian I.","Basileios II."],2,"Die Hagia Sophia wurde unter Justinian I. im Jahr 537 geweiht."],
  ["his-h-03","Geschichte","hard","In welchem Jahr eroberten die Osmanen Konstantinopel?",["1204","1453","1492","1529"],1,"Konstantinopel fiel 1453 an das Osmanische Reich."],
  ["his-h-04","Geschichte","hard","Mit welchen Verträgen wurde 1957 die Europäische Wirtschaftsgemeinschaft gegründet?",["Verträge von Maastricht","Vertrag von Lissabon","Vertrag von Nizza","Römische Verträge"],3,"Die Römischen Verträge wurden 1957 unterzeichnet."],
  ["his-h-05","Geschichte","hard","In welcher Schlacht wurde Napoleon 1815 endgültig besiegt?",["Waterloo","Austerlitz","Leipzig","Borodino"],0,"Napoleons Niederlage bei Waterloo beendete seine Herrschaft."],
  // TECHNIK & DIGITALES - LEICHT
  ["tec-e-01","Technik & Digitales","easy","Wofür steht die Abkürzung WWW?",["World Wide Web","Wide World Wire","Web World Window","World Web Works"],0,"WWW steht für World Wide Web."],
  ["tec-e-02","Technik & Digitales","easy","Welches Gerät bewegt normalerweise den Mauszeiger?",["Drucker","Monitor","Maus","Lautsprecher"],2,"Eine Computermaus steuert den Mauszeiger."],
  ["tec-e-03","Technik & Digitales","easy","Was ist eine E-Mail?",["Eine Papierakte","Eine elektronische Nachricht","Eine Bilddatei","Ein Druckverfahren"],1,"E-Mails sind elektronisch versendete Nachrichten."],
  ["tec-e-04","Technik & Digitales","easy","Wozu dient ein Webbrowser?",["Kabel herstellen","Batterien aufladen","Festplatten formatieren","Webseiten anzeigen"],3,"Browser rufen Webseiten ab und stellen sie dar."],
  ["tec-e-05","Technik & Digitales","easy","Wofür steht USB?",["Universal Serial Bus","Unified System Board","Ultra Speed Binary","User Storage Base"],0,"USB bedeutet Universal Serial Bus."],
  // TECHNIK & DIGITALES - MITTEL
  ["tec-m-01","Technik & Digitales","medium","Welcher HTTP-Statuscode bedeutet 'Not Found'?",["200","301","404","500"],2,"HTTP 404 meldet, dass eine Ressource nicht gefunden wurde."],
  ["tec-m-02","Technik & Digitales","medium","Welche Dateiendung wird üblicherweise für JavaScript verwendet?",[".css",".js",".jpg",".exe"],1,"JavaScript-Dateien haben üblicherweise die Endung .js."],
  ["tec-m-03","Technik & Digitales","medium","Wofür steht RAM?",["Read Access Module","Remote Application Memory","Rapid Arithmetic Mode","Random Access Memory"],3,"RAM steht für Random Access Memory."],
  ["tec-m-04","Technik & Digitales","medium","Welchen Dezimalwert hat die Binärzahl 1010?",["10","8","12","14"],0,"1010 im Dualsystem entspricht 8 + 2 = 10."],
  ["tec-m-05","Technik & Digitales","medium","Welche Sprache steuert typischerweise die Interaktivität im Webbrowser?",["SQL","Markdown","JavaScript","YAML"],2,"JavaScript ermöglicht dynamische Interaktionen auf Webseiten."],
  // TECHNIK & DIGITALES - SCHWER
  ["tec-h-01","Technik & Digitales","hard","Welche Zeitkomplexität besitzt die binäre Suche in einer sortierten Liste?",["O(n^2)","O(log n)","O(n)","O(2^n)"],1,"Die binäre Suche halbiert den Suchbereich bei jedem Schritt."],
  ["tec-h-02","Technik & Digitales","hard","Welcher DNS-Record ordnet einem Hostnamen eine IPv4-Adresse zu?",["MX","TXT","AAAA","A"],3,"Der DNS-Record vom Typ A verweist auf eine IPv4-Adresse."],
  ["tec-h-03","Technik & Digitales","hard","Welcher HTTP-Statuscode bezeichnet eine permanente Weiterleitung?",["301","302","401","503"],0,"HTTP 301 steht für 'Moved Permanently'."],
  ["tec-h-04","Technik & Digitales","hard","Welche Eigenschaften behandelt das CAP-Theorem in verteilten Systemen?",["Cache, API, Performance","CPU, Arbeitsspeicher, Prozesse","Konsistenz, Verfügbarkeit, Partitionstoleranz","Kompression, Authentisierung, Protokollierung"],2,"CAP steht für Consistency, Availability und Partition Tolerance."],
  ["tec-h-05","Technik & Digitales","hard","Wozu dient ein zufälliger Salt beim Hashen von Passwörtern?",["Er verschlüsselt die Netzwerkverbindung.","Er sorgt bei gleichen Passwörtern für unterschiedliche Hashwerte.","Er macht Passwörter kürzer.","Er ersetzt die Passwortprüfung."],1,"Ein individueller Salt erschwert vorab berechnete Hash-Angriffe."],
  // ERGÄNZUNG: ALLGEMEINWISSEN
  ["all-e-06","Allgemeinwissen","easy","Wie viele Monate hat ein Jahr?",["10","11","12","13"],2,"Ein Kalenderjahr besteht aus zwölf Monaten."],
  ["all-e-07","Allgemeinwissen","easy","Welches Tier ist für die Herstellung von Honig bekannt?",["Biene","Ameise","Schmetterling","Libelle"],0,"Honigbienen sammeln Nektar und verarbeiten ihn zu Honig."],
  ["all-e-08","Allgemeinwissen","easy","Welche Form hat ein gewöhnlicher Fußball ungefähr?",["Würfel","Kugel","Kegel","Pyramide"],1,"Ein Fußball ist annähernd kugelförmig."],
  ["all-e-09","Allgemeinwissen","easy","Wie viele Sekunden hat eine Minute?",["30","50","60","100"],2,"Eine Minute besteht aus 60 Sekunden."],
  ["all-e-10","Allgemeinwissen","easy","Welcher Wochentag folgt auf Dienstag?",["Montag","Donnerstag","Freitag","Mittwoch"],3,"Auf Dienstag folgt Mittwoch."],
  ["all-m-06","Allgemeinwissen","medium","Wie viele Seiten hat ein regelmäßiges Sechseck?",["5","6","7","8"],1,"Ein Hexagon besitzt sechs Seiten."],
  ["all-m-07","Allgemeinwissen","medium","Welcher Künstler malte die Mona Lisa?",["Michelangelo","Vincent van Gogh","Leonardo da Vinci","Pablo Picasso"],2,"Leonardo da Vinci schuf die Mona Lisa."],
  ["all-m-08","Allgemeinwissen","medium","Wie lautet das chemische Symbol für Silber?",["Si","S","Au","Ag"],3,"Ag leitet sich vom lateinischen argentum ab."],
  ["all-m-09","Allgemeinwissen","medium","Wie viele Spieler stehen pro Mannschaft beim Fußball regulär auf dem Feld?",["11","9","10","12"],0,"Eine Fußballmannschaft spielt regulär mit elf Spielern."],
  ["all-m-10","Allgemeinwissen","medium","Welche Sprache hat die meisten Muttersprachler weltweit?",["Englisch","Mandarin-Chinesisch","Spanisch","Arabisch"],1,"Mandarin-Chinesisch hat weltweit die meisten Muttersprachler."],
  ["all-h-06","Allgemeinwissen","hard","Welcher Philosoph schrieb 'Sein und Zeit'?",["Karl Popper","Ludwig Wittgenstein","Martin Heidegger","Edmund Husserl"],2,"Martin Heideggers Werk erschien 1927."],
  ["all-h-07","Allgemeinwissen","hard","Welche Konstante ist das Verhältnis von Kreisumfang zu Durchmesser?",["Eulersche Zahl","Goldener Schnitt","Plancksches Wirkungsquantum","Pi"],3,"Die Kreiszahl Pi ist als Umfang geteilt durch Durchmesser definiert."],
  ["all-h-08","Allgemeinwissen","hard","Welche Schrift entzifferte Jean-François Champollion mithilfe des Steins von Rosette?",["Ägyptische Hieroglyphen","Linear A","Keilschrift der Sumerer","Runenschrift"],0,"Champollion gelang der Durchbruch bei der Entzifferung der Hieroglyphen."],
  ["all-h-09","Allgemeinwissen","hard","Welches Werk stammt von Thomas Hobbes?",["Utopia","Leviathan","Der Gesellschaftsvertrag","Der Fürst"],1,"Hobbes veröffentlichte Leviathan 1651."],
  ["all-h-10","Allgemeinwissen","hard","Welche mathematische Konstante ist die Basis des natürlichen Logarithmus?",["Pi","Phi","e","i"],2,"Die Eulersche Zahl e ist die Basis des natürlichen Logarithmus."],

  // ERGÄNZUNG: GEOGRAFIE
  ["geo-e-06","Geografie","easy","Welches Land hat die Hauptstadt Berlin?",["Österreich","Deutschland","Schweiz","Belgien"],1,"Berlin ist die Hauptstadt Deutschlands."],
  ["geo-e-07","Geografie","easy","Welcher Kontinent liegt südlich von Europa jenseits des Mittelmeers?",["Afrika","Asien","Australien","Antarktika"],0,"Afrika liegt südlich des Mittelmeers."],
  ["geo-e-08","Geografie","easy","Welches Gewässer ist ein Meer?",["Rhein","Donau","Mittelmeer","Bodensee"],2,"Das Mittelmeer ist ein Meer zwischen Europa, Afrika und Asien."],
  ["geo-e-09","Geografie","easy","In welchem Land liegt die Stadt Tokio?",["China","Südkorea","Thailand","Japan"],3,"Tokio liegt in Japan."],
  ["geo-e-10","Geografie","easy","Welche Stadt ist die Hauptstadt von Spanien?",["Barcelona","Madrid","Lissabon","Sevilla"],1,"Madrid ist die Hauptstadt Spaniens."],
  ["geo-m-06","Geografie","medium","Welche europäische Hauptstadt liegt an der Moldau?",["Budapest","Warschau","Prag","Bratislava"],2,"Die Moldau fließt durch Prag."],
  ["geo-m-07","Geografie","medium","In welchem Land liegt die antike Felsenstadt Petra?",["Jordanien","Ägypten","Türkei","Libanon"],0,"Petra ist eine berühmte archäologische Stätte in Jordanien."],
  ["geo-m-08","Geografie","medium","Welcher Fluss mündet bei Rotterdam in die Nordsee?",["Elbe","Po","Seine","Rhein"],3,"Der Rhein erreicht über sein Delta die Nordsee."],
  ["geo-m-09","Geografie","medium","Welcher Staat hat die Hauptstadt Wellington?",["Australien","Neuseeland","Fidschi","Irland"],1,"Wellington ist die Hauptstadt Neuseelands."],
  ["geo-m-10","Geografie","medium","Welches Gebirge bildet einen Teil der Grenze zwischen Frankreich und Spanien?",["Alpen","Karpaten","Pyrenäen","Apennin"],2,"Die Pyrenäen liegen zwischen Frankreich und Spanien."],
  ["geo-h-06","Geografie","hard","Welches Land wird vollständig von Südafrika umschlossen?",["Eswatini","Botswana","Namibia","Lesotho"],3,"Lesotho ist eine Enklave innerhalb Südafrikas."],
  ["geo-h-07","Geografie","hard","Welcher Fluss fließt durch die Stadt Bagdad?",["Tigris","Euphrat","Jordan","Nil"],0,"Bagdad liegt am Tigris."],
  ["geo-h-08","Geografie","hard","Auf welcher Insel liegt der Vulkan Ätna?",["Korsika","Sizilien","Sardinien","Kreta"],1,"Der Ätna befindet sich auf Sizilien."],
  ["geo-h-09","Geografie","hard","Welche Hauptstadt liegt am Fluss Daugava (Düna)?",["Tallinn","Vilnius","Riga","Helsinki"],2,"Riga liegt an der Daugava in Lettland."],
  ["geo-h-10","Geografie","hard","Welche Meerenge trennt die Insel Sachalin von Hokkaidō?",["Straße von Gibraltar","Beringstraße","Straße von Malakka","La-Pérouse-Straße"],3,"Die La-Pérouse-Straße liegt zwischen Sachalin und Hokkaidō."],

  // ERGÄNZUNG: NATUR & WISSENSCHAFT
  ["nat-e-06","Natur & Wissenschaft","easy","Welcher Stern steht im Zentrum unseres Sonnensystems?",["Sirius","Polarstern","Sonne","Beteigeuze"],2,"Die Erde und die anderen Planeten umkreisen die Sonne."],
  ["nat-e-07","Natur & Wissenschaft","easy","Was brauchen Pflanzen neben Wasser und Kohlendioxid für die Photosynthese?",["Sonnenlicht","Kunststoff","Sand","Erdöl"],0,"Licht liefert die Energie für die Photosynthese."],
  ["nat-e-08","Natur & Wissenschaft","easy","Welches Tier ist ein Säugetier?",["Forelle","Frosch","Eidechse","Delfin"],3,"Delfine sind im Wasser lebende Säugetiere."],
  ["nat-e-09","Natur & Wissenschaft","easy","Bei welcher Temperatur gefriert reines Wasser bei Normaldruck ungefähr?",["10 °C","0 °C","20 °C","100 °C"],1,"Reines Wasser gefriert bei Normaldruck bei etwa null Grad Celsius."],
  ["nat-e-10","Natur & Wissenschaft","easy","Welches Organ dient hauptsächlich dem Gasaustausch beim Menschen?",["Niere","Magen","Lunge","Milz"],2,"In der Lunge werden Sauerstoff und Kohlendioxid ausgetauscht."],
  ["nat-m-06","Natur & Wissenschaft","medium","Welche Blutkörperchen transportieren hauptsächlich Sauerstoff?",["Erythrozyten","Leukozyten","Thrombozyten","Nervenzellen"],0,"Rote Blutkörperchen enthalten Hämoglobin für den Sauerstofftransport."],
  ["nat-m-07","Natur & Wissenschaft","medium","Welcher Stoff hat die chemische Formel NaCl?",["Zucker","Kochsalz","Ammoniak","Methan"],1,"Natriumchlorid ist der Hauptbestandteil von Kochsalz."],
  ["nat-m-08","Natur & Wissenschaft","medium","Welcher Planet ist für sein auffälliges Ringsystem bekannt?",["Venus","Mars","Merkur","Saturn"],3,"Saturn besitzt ein besonders ausgeprägtes Ringsystem."],
  ["nat-m-09","Natur & Wissenschaft","medium","Welches Gas macht den größten Anteil der Erdatmosphäre aus?",["Sauerstoff","Kohlendioxid","Stickstoff","Argon"],2,"Die Atmosphäre besteht zu etwa 78 Prozent aus Stickstoff."],
  ["nat-m-10","Natur & Wissenschaft","medium","Wie nennt man Tiere, die ihre Körpertemperatur weitgehend selbst konstant halten?",["Gleichwarm","Wechselwarm","Kaltblütig","Photosynthetisch"],0,"Gleichwarme Tiere regulieren ihre Körpertemperatur weitgehend unabhängig von der Umgebung."],
  ["nat-h-06","Natur & Wissenschaft","hard","Welches Enzym synthetisiert DNA anhand einer DNA-Vorlage?",["Ligase","Amylase","Protease","DNA-Polymerase"],3,"DNA-Polymerasen verlängern neue DNA-Stränge während der Replikation."],
  ["nat-h-07","Natur & Wissenschaft","hard","Welche Einheit hat die elektrische Kapazität im SI-System?",["Henry","Farad","Tesla","Siemens"],1,"Die elektrische Kapazität wird in Farad gemessen."],
  ["nat-h-08","Natur & Wissenschaft","hard","Welcher Prozess erzeugt beim radioaktiven Beta-minus-Zerfall ein Elektron und ein Antineutrino?",["Fusion zweier Protonen","Spaltung eines Photons","Umwandlung eines Neutrons in ein Proton","Einfang eines Elektrons"],2,"Beim Beta-minus-Zerfall wird ein Neutron in ein Proton umgewandelt."],
  ["nat-h-09","Natur & Wissenschaft","hard","Welches Molekül überträgt Aminosäuren zum Ribosom?",["tRNA","DNA","Cholesterin","Glykogen"],0,"Transfer-RNA bringt die jeweils passende Aminosäure zur Proteinsynthese."],
  ["nat-h-10","Natur & Wissenschaft","hard","Wie heißt die Grenze zwischen Erdkruste und Erdmantel?",["Tropopause","Mohorovičić-Diskontinuität","Thermokline","Kármán-Linie"],1,"Die Moho markiert die seismisch erkennbare Grenze zwischen Kruste und Mantel."],

  // ERGÄNZUNG: GESCHICHTE
  ["his-e-06","Geschichte","easy","In welcher Stadt steht das Kolosseum?",["Athen","Paris","Rom","London"],2,"Das Kolosseum ist ein antikes Amphitheater in Rom."],
  ["his-e-07","Geschichte","easy","Welcher Seefahrer ist für seine erste Weltumsegelungs-Expedition bekannt?",["Ferdinand Magellan","Marco Polo","James Cook","Christoph Kolumbus"],0,"Magellan leitete die Expedition, die nach seinem Tod die Weltumsegelung vollendete."],
  ["his-e-08","Geschichte","easy","Was wurde in Deutschland 1990 wiedervereinigt?",["Frankreich und Deutschland","Österreich und Deutschland","Nord- und Südkorea","Ost- und Westdeutschland"],3,"Am 3. Oktober 1990 wurde die deutsche Einheit vollzogen."],
  ["his-e-09","Geschichte","easy","Wie nennt man die Epoche der Ritter und Burgen in Europa oft?",["Antike","Mittelalter","Steinzeit","Neuzeit"],1,"Ritter und Burgen werden besonders mit dem europäischen Mittelalter verbunden."],
  ["his-e-10","Geschichte","easy","Welche berühmte Mauer wurde im alten China zur Verteidigung errichtet?",["Berliner Mauer","Hadrianswall","Chinesische Mauer","Klagemauer"],2,"Die Chinesische Mauer umfasst zahlreiche historische Befestigungsanlagen."],
  ["his-m-06","Geschichte","medium","In welchem Jahr begann der Erste Weltkrieg?",["1914","1918","1933","1939"],0,"Der Erste Weltkrieg begann 1914."],
  ["his-m-07","Geschichte","medium","Welche Erfindung wird Johannes Gutenberg besonders zugeschrieben?",["Dampfmaschine","Telefon","Glühbirne","Buchdruck mit beweglichen Metalllettern in Europa"],3,"Gutenberg entwickelte den europäischen Buchdruck mit beweglichen Metalllettern entscheidend weiter."],
  ["his-m-08","Geschichte","medium","Welche antike Stadt wurde 79 n. Chr. beim Ausbruch des Vesuvs verschüttet?",["Troja","Pompeji","Sparta","Karthago"],1,"Pompeji wurde 79 n. Chr. beim Vesuvausbruch verschüttet."],
  ["his-m-09","Geschichte","medium","Welcher Herrscher wurde 800 zum Kaiser gekrönt?",["Otto I.","Friedrich Barbarossa","Karl der Große","Ludwig XIV."],2,"Karl der Große wurde im Jahr 800 in Rom zum Kaiser gekrönt."],
  ["his-m-10","Geschichte","medium","Welches Ereignis fand am 14. Juli 1789 in Paris statt?",["Sturm auf die Bastille","Krönung Napoleons","Beginn des Wiener Kongresses","Unterzeichnung des Versailler Vertrags"],0,"Der Sturm auf die Bastille wurde zum Symbol der Französischen Revolution."],
  ["his-h-06","Geschichte","hard","Welcher Vertrag von 1494 teilte außereuropäische Einflussgebiete zwischen Spanien und Portugal auf?",["Vertrag von Utrecht","Vertrag von Tordesillas","Vertrag von Nanking","Vertrag von Brest-Litowsk"],1,"Der Vertrag von Tordesillas regelte 1494 die Aufteilung von Interessensphären."],
  ["his-h-07","Geschichte","hard","Welche Dynastie regierte China unmittelbar vor der Qing-Dynastie?",["Han","Tang","Song","Ming"],3,"Auf die Ming-Dynastie folgte im 17. Jahrhundert die Qing-Dynastie."],
  ["his-h-08","Geschichte","hard","Welches Konzil tagte von 1545 bis 1563 in mehreren Sitzungsperioden?",["Konzil von Trient","Erstes Konzil von Nicäa","Konzil von Konstanz","Zweites Vatikanisches Konzil"],0,"Das Konzil von Trient war zentral für die katholische Reform."],
  ["his-h-09","Geschichte","hard","Welcher Aufstand begann 1850 in China und dauerte bis 1864?",["Boxeraufstand","Gelbe-Turban-Aufstand","Taiping-Aufstand","Sepoy-Aufstand"],2,"Der Taiping-Aufstand erschütterte das Qing-Reich von 1850 bis 1864."],
  ["his-h-10","Geschichte","hard","Welche Seeschlacht fand 1571 zwischen der Heiligen Liga und dem Osmanischen Reich statt?",["Trafalgar","Lepanto","Salamis","Jütland"],1,"Die Seeschlacht von Lepanto fand 1571 im Golf von Patras statt."],

  // ERGÄNZUNG: TECHNIK & DIGITALES
  ["tec-e-06","Technik & Digitales","easy","Welches Gerät gibt Texte und Bilder auf Papier aus?",["Router","Scanner","Drucker","Mikrofon"],2,"Ein Drucker überträgt digitale Inhalte auf Papier."],
  ["tec-e-07","Technik & Digitales","easy","Was bedeutet ein Vorhängeschloss-Symbol in der Adressleiste meist?",["Die Verbindung ist verschlüsselt","Der Computer ist ausgeschaltet","Die Seite ist kostenpflichtig","Die Datei ist gelöscht"],0,"Das Symbol weist gewöhnlich auf eine verschlüsselte HTTPS-Verbindung hin; es garantiert keine Seriosität."],
  ["tec-e-08","Technik & Digitales","easy","Welche Taste erzeugt normalerweise ein Leerzeichen?",["Enter","Escape","Tab","Leertaste"],3,"Die Leertaste fügt ein Leerzeichen ein."],
  ["tec-e-09","Technik & Digitales","easy","Wie nennt man ein tragbares Computergerät mit Bildschirm und Tastatur?",["Serverrack","Laptop","Drucker","Beamer"],1,"Ein Laptop ist ein tragbarer Computer."],
  ["tec-e-10","Technik & Digitales","easy","Welche Einheit wird häufig für die Größe von Dateien verwendet?",["Volt","Hertz","Byte","Newton"],2,"Dateigrößen werden häufig in Byte oder Vielfachen davon angegeben."],
  ["tec-m-06","Technik & Digitales","medium","Wofür steht HTTPS?",["Hypertext Transfer Protocol Secure","High Performance Transfer System","Hyperlink Text Processing Service","Hosted Transmission Protocol Standard"],0,"HTTPS bezeichnet HTTP über eine gesicherte Verbindung."],
  ["tec-m-07","Technik & Digitales","medium","Welches Datenbanksystem verwendet typischerweise SQL als Abfragesprache?",["Bildbearbeitung","Betriebssystemkern","Grafikkartentreiber","Relationale Datenbank"],3,"SQL wird insbesondere zum Abfragen relationaler Datenbanken verwendet."],
  ["tec-m-08","Technik & Digitales","medium","Wie viele Bits enthält ein Byte üblicherweise?",["4","8","16","32"],1,"Ein Byte besteht in heutigen Computersystemen üblicherweise aus acht Bits."],
  ["tec-m-09","Technik & Digitales","medium","Welches Protokoll wird hauptsächlich zum Auflösen von Domainnamen in IP-Adressen verwendet?",["SMTP","FTP","DNS","SSH"],2,"Das Domain Name System liefert unter anderem IP-Adressen zu Domainnamen."],
  ["tec-m-10","Technik & Digitales","medium","Welche Auszeichnungssprache beschreibt die Struktur einer Webseite?",["HTML","CSS","SQL","JSON"],0,"HTML strukturiert Inhalte wie Überschriften, Absätze und Links."],
  ["tec-h-06","Technik & Digitales","hard","Welcher TCP-Mechanismus baut eine neue Verbindung üblicherweise auf?",["Vier-Wege-Handshake","Drei-Wege-Handshake","Token-Ring","DNS-Zonentransfer"],1,"TCP nutzt beim Verbindungsaufbau SYN, SYN-ACK und ACK."],
  ["tec-h-07","Technik & Digitales","hard","Welches Problem löst ein Mutex in nebenläufigen Programmen hauptsächlich?",["Bildkompression","Netzwerkrouting","Speicherdefragmentierung","Wechselseitiger Ausschluss beim Zugriff auf Ressourcen"],3,"Ein Mutex verhindert gleichzeitigen Zugriff mehrerer Threads auf einen kritischen Abschnitt."],
  ["tec-h-08","Technik & Digitales","hard","Welche Eigenschaft garantiert eine kryptografische Hashfunktion ausdrücklich nicht?",["Umkehrbarkeit des Hashwerts","Deterministische Ausgabe","Feste Ausgabelänge bei festem Algorithmus","Verarbeitung variabler Eingaben"],0,"Kryptografische Hashfunktionen sind gerade auf schwer umkehrbare Abbildungen ausgelegt."],
  ["tec-h-09","Technik & Digitales","hard","Welche Normalform verlangt in relationalen Datenbanken unter anderem das Fehlen transitiver Abhängigkeiten von Nichtschlüsselattributen?",["Erste Normalform","Zweite Normalform","Dritte Normalform","Boyce-Codd-Normalform ausschließlich"],2,"In der dritten Normalform werden transitive Abhängigkeiten von Nichtschlüsselattributen ausgeschlossen."],
  ["tec-h-10","Technik & Digitales","hard","Was bezeichnet bei IPv6 die Präfixlänge /64?",["64 mögliche Hosts insgesamt","64 Bits für das Netzpräfix","64 Byte Paketgröße","64 Router pro Netzwerk"],1,"Bei einem IPv6-Präfix /64 gehören die ersten 64 Bits zum Netzpräfix."],
];

// Der restliche Spielcode arbeitet mit benannten Eigenschaften.
window.QUIZ_QUESTIONS = QUESTION_ROWS.map(
  ([id, category, difficulty, question, answers, correctIndex, explanation]) => ({
    id, category, difficulty, question, answers, correctIndex, explanation
  })
);
