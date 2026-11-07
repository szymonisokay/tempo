import type { Lang } from "./types";

/**
 * Słowniki do generatora. Celowo krótkie i ręcznie dobrane: częste słowa
 * plus takie, które ćwiczą polskie znaki i trudne połączenia (rz, sz, cz, ść).
 * Docelowo zastąpimy je listami frekwencyjnymi (sprawdzić licencję!).
 */
const PL = `
nie się to na jest jak tak ale czy już tylko może przez jego bardzo wszystko
kiedy teraz gdzie dobrze jeszcze życie będzie można sobie który dzień ręka
często źródło później więc mówić człowiek właśnie coś dziś miasto szkoła
książka pięć cześć rzeka gość łatwo światło wieczór ogień przyjaciel zawsze
pytanie praca dom woda słowo myśleć chcieć mały duży nowy dobry żółty zielony
ziemia wiatr mąż żona dziecko świat noc rano jeść pić iść spać kość ściana
śnieg ślad źle żaba każdy mężczyzna chleb ucho dźwięk dźwig rzecz morze orzech
rzadko przed trzeba szybko czas czytać pisać szczęście szczyt łąka łódź pies
kot dąb ząb mąka ręce gęś ból sól stół król góra pióro ołówek okno drzwi głowa
noga oko serce miłość radość młody stary ciepły zimny jasny ciemny wysoki
niski blisko daleko razem swój nasz mój twój gdzieś nigdy wczoraj jutro
tydzień miesiąc rok godzina minuta pociąg samochód rower droga ulica sklep
pieniądze komputer klawiatura ekran litera zdanie tekst język polski chmura
deszcz słońce księżyc gwiazda
`;

const EN = `
the be to of and in that have it for not on with he as you do at this but his
by from they we say her she or will my one all would there their what so up
out if about who get which go me when make can like time no just him know take
people into year your good some could them see other than then now look only
come its over think also back after use two how our work first well way even
new want because any these give day most great world still between keyboard
type quick quite question brown fox box jumps lazy dog letter word sentence
practice speed finger hand home row thing nothing morning evening something
during bring king string typing writing where why while white three both month
truth size zero next six extra example life place school house water city
night number point small large old young long short high right left
`;

function toList(raw: string): readonly string[] {
  const words = raw
    .normalize("NFC")
    .split(/\s+/)
    .filter(Boolean);
  return Object.freeze(Array.from(new Set(words)));
}

export const WORDS: Readonly<Record<Lang, readonly string[]>> = Object.freeze({
  pl: toList(PL),
  en: toList(EN),
});
