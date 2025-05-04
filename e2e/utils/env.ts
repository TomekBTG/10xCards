import * as fs from 'fs';
import * as path from 'path';

/**
 * Ładuje zmienne środowiskowe z pliku .env.test
 */
export function loadEnvFile(): Record<string, string> {
  try {
    // Ścieżka do pliku .env.test w głównym katalogu projektu
    const envPath = path.resolve(process.cwd(), '.env.test');
    
    // Sprawdź czy plik istnieje
    if (!fs.existsSync(envPath)) {
      console.warn('Plik .env.test nie został znaleziony');
      return {};
    }
    
    // Odczytaj zawartość pliku
    const envContent = fs.readFileSync(envPath, 'utf-8');
    
    // Parsuj zmienne środowiskowe
    const envVars: Record<string, string> = {};
    envContent.split('\n').forEach(line => {
      // Pomiń puste linie i komentarze
      if (!line || line.startsWith('#')) return;
      
      // Pobierz klucz i wartość
      const [key, value] = line.split('=');
      if (key && value) {
        envVars[key.trim()] = value.trim();
      }
    });
    
    return envVars;
  } catch (error) {
    console.error('Błąd podczas ładowania pliku .env.test:', error);
    return {};
  }
}

/**
 * Ustawia zmienne środowiskowe z pliku .env.test
 */
export function setupEnv(): void {
  const envVars = loadEnvFile();
  
  // Ustaw zmienne środowiskowe
  Object.entries(envVars).forEach(([key, value]) => {
    process.env[key] = value;
  });
  
  console.log('Załadowano zmienne środowiskowe z pliku .env.test');
} 