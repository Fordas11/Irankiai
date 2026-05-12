import { useState } from "react";
import { useStore } from '../store/useStore';
import { AutomatoController } from "../controllers/AutomatoController";
import type { Automatas, AutomatoBūsena } from "../types/automatas";


export function useMachinesViewModel() {
    const [search, setSearch] = useState('');
    const [filterStatus, setFilterStatus] = useState<string>('all');
    const [modal, setModal] = useState<'add' | 'edit' | 'delete' | 'confirmCreate' | null>(null);
    const [selected, setSelected] = useState<Automatas | null>(null);
    const [form, setForm] = useState(AutomatoController.atidarytiKūrimoFormą());
    const [klaida, setKlaida] = useState<string | null>(null);

     {/* Use case: Perziureti automatu sarasa. Sequence: step 3, step 6 (Gauti visus automatus(), rodyti automatu sarasa) 
            AutomatoViewModelController ---> AutomatoController (controller)
            AutomatoViewModelController <- - - AutomatoController (controller)
        Use case: Perziureti automatu sarasa. Sequence: step 10, step 13 
        (filtruotiAutomatus(filter), rodyti filtruota automatu sarasa)
            AutomatoViewModelController ---> AutomatoController (controller)
            AutomatoViewModelController <- - - AutomatoController (controller)*/}
    const filtered = AutomatoController.filtruotiAutomatus({ search, status: filterStatus });
    const { currentUser } = useStore();
    const isAdmin = currentUser?.role === 'administrator';

    const { machines, machineProducts, tasks } = useStore();

    const totalRevenue = machines.reduce((s, m) => s + m.revenue_today, 0);
    const active = machines.filter(m => m.status === 'operational').length;
    const needsService = machines.filter(m => m.status === 'needs_service' || m.status === 'broken').length;
    const offline = machines.filter(m => m.status === 'offline').length;

    const pendingTasks = tasks.filter(t => t.status === 'pending').length;
    const avgStock = (() => {
        if (!machineProducts.length) return 0;
        const pct = machineProducts.reduce((s, mp) => s + mp.quantity / mp.max_quantity, 0) / machineProducts.length;
        return Math.round(pct * 100);
    })();

    const getStockPct = (machineId: string) => {
        const mps = machineProducts.filter(mp => mp.machine_id === machineId);
        if (!mps.length) return 0;
        return Math.round(mps.reduce((s, mp) => s + mp.quantity / mp.max_quantity, 0) / mps.length * 100);
    };

    const STATUSES = ['operational', 'offline', 'needs_service', 'broken', 'maintenance', 'servicing'];
    const STATUS_LABEL: Record<AutomatoBūsena, string> = {
        operational: 'Operational',
        offline: 'Offline',
        needs_service: 'Needs Service',
        broken: 'Broken',
        maintenance: 'Maintenence',
        servicing: 'Servicing',
    };
    const STATUS_STYLE: Record<AutomatoBūsena, string> = {
        operational: 'bg-green-100 text-green-700',
        offline: 'bg-slate-100 text-slate-600',
        needs_service: 'bg-yellow-100 text-yellow-700',
        broken: 'bg-red-100 text-red-700',
        maintenance: 'bg-blue-100 text-blue-700',
        servicing: 'bg-purple-100 text-purple-700',
    };
    const STATUS_DOT: Record<string, string> = {
        operational: 'bg-green-500',
        offline: 'bg-slate-400',
        needs_service: 'bg-yellow-500',
        broken: 'bg-red-500',
        maintenance: 'bg-blue-500',
        servicing: 'bg-purple-500',
    };
    const INPUT = 'w-full px-4 py-2.5 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white';

    const rodytiKurimoForma = (pradiniai: typeof form) => {
        setForm(pradiniai);
        setKlaida(null);
        setModal('add');
    };

    /*  Use case: Perziureti automatu sarsa. Sequence step 17, step 18 (atidarytiKurimoForma(), atvaizduoti)
            AutomatoViewModelController ---> AutomatoController (controller)
            AutomatoViewModelController <- - - AutomatoController (controller)
        Use case: Perziureti automatu sarasa. Sequence: step 19 (atvaizduoti) 
            AutomatuKurimoLangas □<- - - AutomatoViewModelController (view model(controller))*/
    const pasirinktiSukurtiNaujaAutomata = () => {
        const pradiniai = AutomatoController.atidarytiKūrimoFormą();
        rodytiKurimoForma(pradiniai)
    };

    const atvaizduotiSukurtaAutomataSarase = () => {
        uzdarytiModala();
    };
    const rodytiKlaidosPranesima = (klaida: string) => {
        setKlaida(klaida);
    };
    const redaguotiAutomata = (m: Automatas) => {
        setForm({
            name: m.name,
            model: m.model,
            address: m.address,
            longitude: m.longitude,
            latitude: m.latitude,
            status: m.status,
            last_serviced: m.last_serviced,
        });
        setModal('edit');
    }
    const patvirtintiAutomatoSalinima = (m: Automatas) => {
        setSelected(m);
        setModal('delete');
    }
    const uzdarytiModala = () => {
        setModal(null);
        setSelected(null);
        setKlaida(null);
    };
    const pateiktiAutomatoDuomenis = (e: React.SyntheticEvent) => {
        e.preventDefault();

        if (modal === 'edit' && selected) {
            AutomatoController.atnaujintiAutomata(selected.id, form);
            uzdarytiModala();
            return;
        }
        setModal('confirmCreate')
    };
    /*  Use case: Sukurti automata. Sequence: step 4 (sukurtiAutomata())
            AutomatoViewModelController ---> AutomatoController 
        Use case: Sukurti automata. Sequence: step 8, step 10 (atvaizduotiAutomataSarase(), rodytiKlaidosZinute())
                AutomatoViewModelController <- - - AutomatoController 
                AutomatoViewModelController <- - - AutomatoController  */
    const patvirtintiKurima = () =>{
        AutomatoController.PatvirtintiAutomatoKūrimą(
            form,
            atvaizduotiSukurtaAutomataSarase,
            rodytiKlaidosPranesima
        )
    }
    return {
        search,
        setSearch,
        filterStatus,
        setFilterStatus,
        modal,
        setModal,
        selected,
        form,
        setForm,
        klaida,
        filtered,
        isAdmin,
        STATUSES,
        STATUS_LABEL,
        STATUS_STYLE,
        INPUT,
        STATUS_DOT,
        totalRevenue,
        active,
        needsService,
        offline,
        pendingTasks,
        avgStock,
        machines,
        tasks,
        getStockPct,
        pasirinktiSukurtiNaujaAutomata,
        redaguotiAutomata,
        patvirtintiAutomatoSalinima,
        uzdarytiModala,
        pateiktiAutomatoDuomenis,
        patvirtintiKurima,
    };



}