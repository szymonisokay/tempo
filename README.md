# tempo

Trening szybkiego pisania na klawiaturze po polsku i po angielsku.

To jest **MVP**: generator tekstu do przepisywania i klawiatura ekranowa, która
podpowiada następny klawisz. Bez kont — ustawienia i historia wyników zapisują
się w `localStorage` przeglądarki.

## Co już działa

- **Generator tekstu**: język (PL/EN), długość (25/50/100 słów), interpunkcja,
  cyfry.
- **Ćwicz litery**: wpisz litery lub połączenia (np. `ż rz ść`) albo wybierz
  gotowy zestaw — około 3/4 tekstu będą stanowić słowa, które je zawierają.
- **Pisanie**: spacja zatwierdza słowo, Backspace poprawia bieżące słowo, tekst
  przewija się sam (widać 3 linie). Wklejanie jest zablokowane.
- **Klawiatura ekranowa** (układ polski programisty): podświetla następny
  klawisz razem z Shiftem lub AltGr, miga na biało przy dobrym naciśnięciu,
  na czerwono przy złym, po błędzie podświetla Backspace. Kolory palców można
  wyłączyć.
- **Wynik**: WPM, znaki na minutę, celność, czas, błędy, najczęściej mylone
  znaki i przycisk „Ćwicz te litery”, który generuje tekst z Twoich błędów.
- **Historia**: ostatnie wyniki i rekordy dla każdego języka.

Skróty: `Esc` — nowy tekst, `Enter` po zakończeniu — nowy tekst.

## Uruchomienie

Potrzebny Node.js 22 lub nowszy.

```bash
npm install
npm run dev
```

Aplikacja wystartuje na http://localhost:3000.

## Skrypty

| Skrypt              | Co robi                         |
| ------------------- | ------------------------------- |
| `npm run dev`       | serwer deweloperski             |
| `npm run build`     | build produkcyjny               |
| `npm start`         | uruchamia build produkcyjny     |
| `npm test`          | testy jednostkowe (Vitest)      |
| `npm run lint`      | ESLint                          |
| `npm run typecheck` | sprawdzenie typów TypeScript    |

## Struktura

```
src/
  app/                    Next.js (App Router): layout, strona główna, style
  components/
    trainer/              widok trenera: ustawienia, tekst, wynik, klawiatura, historia
    ui/                   drobne komponenty wielokrotnego użytku
  lib/
    engine/               czysta logika bez Reacta — generator, sesja, klawisze (+ testy)
    storage.ts            ustawienia i historia w localStorage
    format.ts             formatowanie liczb i dat po polsku
```

Cała logika pisania siedzi w `src/lib/engine` i nie zależy od Reacta ani DOM.
Komponenty tylko ją wywołują i wyświetlają wynik — dzięki temu logikę łatwo
testować i będzie można jej użyć np. w trybie wyścigów albo w aplikacji mobilnej.

Trener renderuje się tylko w przeglądarce (`next/dynamic` z `ssr: false`), bo
losuje tekst i czyta `localStorage` — wersja z serwera i tak różniłaby się od tej
w przeglądarce.

## Jak liczymy wyniki

- **WPM** = poprawne znaki ÷ 5 na minutę. Liczą się tylko całkowicie poprawne
  słowa (plus spacje między nimi) i poprawny początek bieżącego słowa.
  Dzięki dzieleniu przez 5 wyniki po polsku i po angielsku są porównywalne,
  choć polskie słowa są dłuższe.
- **Znaki na minutę** = poprawne znaki na minutę (popularne w Polsce).
- **Celność** = naciśnięcia bez błędu ÷ wszystkie naciśnięcia dodające znak.
  Backspace się nie liczy, ale błąd zostaje policzony, nawet jeśli go poprawisz.
- W pierwszej sekundzie WPM pokazuje 0, bo wynik skakałby jak szalony.

## Co dalej

1. Konta i synchronizacja wyników (Supabase), wykresy postępu.
2. Kurs od zera i trening dopasowany do najwolniejszych połączeń liter.
3. Tryby: na czas, cytaty, własny tekst; jasny motyw; inne układy klawiatury.
4. Ranking z weryfikacją wyników po stronie serwera.
