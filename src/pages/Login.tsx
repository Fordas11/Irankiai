import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NaudotojoController } from '../controllers/NaudotojoController';

// Ribinė klasė: Prisijungti (Boundary) — paketas: Naudotojas
// 4.2.21 Prisijungti sekų diagrama
export default function Prisijungti() {
  const [gmail, setGmail] = useState('');
  const [slaptažodis, setSlaptažodis] = useState('');
  const [klaida, setKlaida] = useState('');
  const navigate = useNavigate();

  // Step 7: AtidarytiPagrindiniLanga (NaudotojoController → Prisijungti boundary)
  const AtidarytiPagrindiniLanga = () => {
    navigate('/');
  };

  // Step 10: rodytKlaidosPranesima (NaudotojoController → Prisijungti boundary)
  const rodytKlaidosPranesima = (žinute: string) => {
    setKlaida(žinute);
  };

  // Step 3: loginai (Naudotojas → Prisijungti boundary)
  const loginai = (e: React.SyntheticEvent) => {
    e.preventDefault();
    // Step 4: perduotiPrisijungimoDuomenis (boundary → NaudotojoController)
    NaudotojoController.perduotiPrisijungimoDuomenis(
      gmail,
      slaptažodis,
      AtidarytiPagrindiniLanga,
      rodytKlaidosPranesima
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-lg w-full max-w-sm p-8">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-3">V</div>
          <h1 className="text-xl font-bold text-slate-800">VendingOS</h1>
          <p className="text-sm text-slate-500 mt-1">Vending Machine Management System</p>
        </div>

        {/* Step 2: Parodo prisijungimo formą */}
        <form onSubmit={loginai} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
            <input
              type="email"
              value={gmail}
              onChange={e => setGmail(e.target.value)}
              placeholder="name@vendingos.com"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
            <input
              type="password"
              value={slaptažodis}
              onChange={e => setSlaptažodis(e.target.value)}
              placeholder="••••••••"
              required
              className="w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          {/* Step 11: Parodo klaida */}
          {klaida && <p className="text-sm text-red-600 bg-red-50 px-4 py-2.5 rounded-lg">{klaida}</p>}
          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Sign In
          </button>
        </form>

        <div className="mt-6 p-4 bg-slate-50 rounded-lg text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-600 mb-2">Demo accounts:</p>
          <p>admin@vendingos.com / admin123</p>
          <p>john@vendingos.com / john123</p>
          <p>sarah@vendingos.com / sarah123</p>
        </div>
      </div>
    </div>
  );
}
