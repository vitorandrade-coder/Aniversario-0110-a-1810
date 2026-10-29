import React, { useState, useMemo, useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { 
  CAMPAIGN_POSTS, 
  getTotals, 
  getPlatformTotals, 
  OFFICIAL_PLATFORM_STATS,
  PostItem 
} from './data/campaignData';
import { 
  Eye, 
  Users, 
  Heart, 
  MessageCircle, 
  Share2, 
  Bookmark, 
  ExternalLink, 
  TrendingUp, 
  Layers, 
  BarChart3, 
  Filter, 
  RotateCcw, 
  FileSpreadsheet, 
  Printer, 
  Search,
  MousePointerClick,
  Sparkles,
  CheckCircle2,
  PieChart as PieChartIcon
} from 'lucide-react';

export default function App() {
  const [platformFilter, setPlatformFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'data' | 'impressoes' | 'interacoes' | 'engajamento'>('data');
  const [isCsvModalOpen, setIsCsvModalOpen] = useState(false);
  const [isGlossaryModalOpen, setIsGlossaryModalOpen] = useState(false);
  const [copyFeedback, setCopyFeedback] = useState(false);

  // Refs para os canvas dos gráficos
  const chartStackedRef = useRef<HTMLCanvasElement | null>(null);
  const chartDoughnutRef = useRef<HTMLCanvasElement | null>(null);
  const chartBarComparativoRef = useRef<HTMLCanvasElement | null>(null);

  // Instâncias do Chart.js
  const chartStackedInstance = useRef<Chart | null>(null);
  const chartDoughnutInstance = useRef<Chart | null>(null);
  const chartBarComparativoInstance = useRef<Chart | null>(null);

  // Filtragem dos posts
  const filteredPosts = useMemo(() => {
    return CAMPAIGN_POSTS.filter(post => {
      if (platformFilter !== 'all' && post.plataforma !== platformFilter) {
        return false;
      }
      if (dateFilter !== 'all' && post.data !== dateFilter) {
        return false;
      }
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchPlat = post.plataforma.toLowerCase().includes(q);
        const matchFormat = (post.formato || '').toLowerCase().includes(q);
        const matchGroup = post.grupo.toLowerCase().includes(q);
        const matchDay = post.diaSemana.toLowerCase().includes(q);
        const matchCategory = post.categoria.toLowerCase().includes(q);
        if (!matchPlat && !matchFormat && !matchGroup && !matchDay && !matchCategory) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'impressoes') return b.impressoes - a.impressoes;
      if (sortBy === 'interacoes') return b.interacoes - a.interacoes;
      if (sortBy === 'engajamento') return b.engajamento - a.engajamento;
      return b.data.localeCompare(a.data);
    });
  }, [platformFilter, dateFilter, searchQuery, sortBy]);

  // Totais calculados
  const totals = useMemo(() => getTotals(filteredPosts), [filteredPosts]);

  // Totais por plataforma
  const platformStats = useMemo(() => getPlatformTotals(filteredPosts), [filteredPosts]);

  // Formatação de números
  const formatNumber = (num: number) => new Intl.NumberFormat('pt-BR').format(num);

  // Gráficos Chart.js
  useEffect(() => {
    // 1. GRÁFICO 1: PERFORMANCE COMPARATIVA DOS CANAIS
    if (chartStackedRef.current) {
      if (chartStackedInstance.current) {
        chartStackedInstance.current.destroy();
      }

      let labels: string[] = [];
      let dataImpressoes: number[] = [];
      let dataAlcance: number[] = [];
      let dataInteracoes: number[] = [];

      if (platformFilter === 'all') {
        const plats = ['Instagram Feed', 'Instagram Stories', 'Facebook', 'Tiktok'];
        labels = plats;
        plats.forEach(plat => {
          const items = filteredPosts.filter(p => p.plataforma === plat);
          dataImpressoes.push(items.reduce((acc, p) => acc + p.impressoes, 0));
          dataAlcance.push(items.reduce((acc, p) => acc + p.alcance, 0));
          dataInteracoes.push(items.reduce((acc, p) => acc + p.interacoes, 0));
        });
      } else {
        // Mostra evolução diária de 01/10 a 27/10
        const dates = [
          '2026-10-01', '2026-10-02', '2026-10-03', '2026-10-04',
          '2026-10-05', '2026-10-06', '2026-10-07', '2026-10-08',
          '2026-10-09', '2026-10-10', '2026-10-11', '2026-10-12',
          '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-16',
          '2026-10-17', '2026-10-18', '2026-10-19', '2026-10-20',
          '2026-10-21', '2026-10-22', '2026-10-23', '2026-10-24',
          '2026-10-25', '2026-10-26', '2026-10-27'
        ];
        labels = [
          '01/10 (Qui)', '02/10 (Sex)', '03/10 (Sáb)', '04/10 (Dom)',
          '05/10 (Seg)', '06/10 (Ter)', '07/10 (Qua)', '08/10 (Qui)',
          '09/10 (Sex)', '10/10 (Sáb)', '11/10 (Dom)', '12/10 (Seg)',
          '13/10 (Ter)', '14/10 (Qua)', '15/10 (Qui)', '16/10 (Sex)',
          '17/10 (Sáb)', '18/10 (Dom)', '19/10 (Seg)', '20/10 (Ter)',
          '21/10 (Qua)', '22/10 (Qui)', '23/10 (Sex)', '24/10 (Sáb)',
          '25/10 (Dom)', '26/10 (Seg)', '27/10 (Ter)'
        ];
        dates.forEach(d => {
          const items = filteredPosts.filter(p => p.data === d);
          dataImpressoes.push(items.reduce((acc, p) => acc + p.impressoes, 0));
          dataAlcance.push(items.reduce((acc, p) => acc + p.alcance, 0));
          dataInteracoes.push(items.reduce((acc, p) => acc + p.interacoes, 0));
        });
      }

      chartStackedInstance.current = new Chart(chartStackedRef.current, {
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: 'Impressões (Impactos)',
              data: dataImpressoes,
              backgroundColor: '#005599',
              borderRadius: 6
            },
            {
              label: 'Alcance Único',
              data: dataAlcance,
              backgroundColor: '#38bdf8',
              borderRadius: 6
            },
            {
              label: 'Interações',
              data: dataInteracoes,
              backgroundColor: '#F47920',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 650,
            easing: 'easeOutQuart'
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#0f172a',
              titleColor: '#f8fafc',
              bodyColor: '#f8fafc',
              padding: 12,
              cornerRadius: 8,
              titleFont: { size: 13, weight: 'bold' },
              bodyFont: { size: 12 },
              callbacks: {
                label: function (context) {
                  let label = context.dataset.label || '';
                  if (label) label += ': ';
                  const val = context.parsed.y ?? 0;
                  return `${label}${new Intl.NumberFormat('pt-BR').format(val)}`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#475569',
                font: { size: 12, weight: 'bold' }
              }
            },
            y: {
              grid: { color: '#f1f5f9' },
              ticks: {
                color: '#64748b',
                font: { size: 11 },
                callback: function (value: any) {
                  return (value / 1000) >= 1 ? (value / 1000) + 'k' : value;
                }
              }
            }
          }
        }
      });
    }

    // 2. GRÁFICO 2: ROSCA (DOUGHNUT) DAS INTERAÇÕES
    if (chartDoughnutRef.current) {
      if (chartDoughnutInstance.current) {
        chartDoughnutInstance.current.destroy();
      }

      const totalInt = totals.interacoes || 1;
      const curtidas = totals.curtidas || 0;
      const cliques = totals.cliquesLink || 0;
      const envios = totals.compartilhamentos || 0;
      const comentarios = totals.comentarios || 0;
      const salvos = totals.salvos || 0;
      const outros = Math.max(0, totals.interacoes - (curtidas + cliques + envios + comentarios + salvos));

      const doughnutLabels = ['Curtidas', 'Cliques no Link (Stories)', 'Envios / Shares', 'Comentários', 'Salvos (Feed)'];
      const doughnutData = [curtidas, cliques, envios, comentarios, salvos];
      const doughnutColors = ['#F47920', '#005599', '#38bdf8', '#6366f1', '#eab308'];

      if (outros > 0) {
        doughnutLabels.push('Outras Interações');
        doughnutData.push(outros);
        doughnutColors.push('#94a3b8');
      }

      chartDoughnutInstance.current = new Chart(chartDoughnutRef.current, {
        type: 'doughnut',
        data: {
          labels: doughnutLabels,
          datasets: [
            {
              data: doughnutData,
              backgroundColor: doughnutColors,
              hoverOffset: 6,
              borderWidth: 2,
              borderColor: '#ffffff'
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '65%',
          animation: {
            animateScale: true,
            animateRotate: true,
            duration: 750
          },
          plugins: {
            legend: {
              display: false
            },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (context) {
                  const label = context.label || '';
                  const val = (context.parsed as number) || 0;
                  const pct = ((val / totalInt) * 100).toFixed(1) + '%';
                  return ` ${label}: ${new Intl.NumberFormat('pt-BR').format(val)} (${pct})`;
                }
              }
            }
          }
        }
      });
    }

    // 3. GRÁFICO 3: BARRAS AGRUPADAS - ESFORÇO VS. RESULTADO
    if (chartBarComparativoRef.current) {
      if (chartBarComparativoInstance.current) {
        chartBarComparativoInstance.current.destroy();
      }

      const totalImp = totals.impressoes || 1;
      const totalInt = totals.interacoes || 1;

      const platforms = ['Instagram Feed', 'Instagram Stories', 'Facebook', 'Tiktok'];
      const pctImpactos = platforms.map(plat => {
        const sum = filteredPosts.filter(p => p.plataforma === plat).reduce((a, b) => a + b.impressoes, 0);
        return Number(((sum / totalImp) * 100).toFixed(1));
      });
      const pctInteracoes = platforms.map(plat => {
        const sum = filteredPosts.filter(p => p.plataforma === plat).reduce((a, b) => a + b.interacoes, 0);
        return Number(((sum / totalInt) * 100).toFixed(1));
      });

      chartBarComparativoInstance.current = new Chart(chartBarComparativoRef.current, {
        type: 'bar',
        data: {
          labels: ['Feed', 'Stories', 'Facebook', 'TikTok'],
          datasets: [
            {
              label: '% Impactos (Impressões)',
              data: pctImpactos,
              backgroundColor: '#005599',
              borderRadius: 6
            },
            {
              label: '% Interações Geradas',
              data: pctInteracoes,
              backgroundColor: '#F47920',
              borderRadius: 6
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 700,
            easing: 'easeOutQuart'
          },
          interaction: {
            mode: 'index',
            intersect: false
          },
          plugins: {
            legend: {
              position: 'top',
              labels: {
                boxWidth: 12,
                boxHeight: 12,
                usePointStyle: true,
                pointStyle: 'rectRounded',
                color: '#475569',
                font: { size: 11, weight: 'bold' }
              }
            },
            tooltip: {
              backgroundColor: '#0f172a',
              padding: 12,
              cornerRadius: 8,
              callbacks: {
                label: function (context) {
                  return ` ${context.dataset.label}: ${context.parsed.y}%`;
                }
              }
            }
          },
          scales: {
            x: {
              grid: { display: false },
              ticks: {
                color: '#475569',
                font: { size: 11, weight: 'bold' }
              }
            },
            y: {
              beginAtZero: true,
              max: 100,
              grid: { color: '#f1f5f9' },
              ticks: {
                color: '#64748b',
                callback: function (val: any) {
                  return val + '%';
                }
              }
            }
          }
        }
      });
    }

    return () => {
      if (chartStackedInstance.current) chartStackedInstance.current.destroy();
      if (chartDoughnutInstance.current) chartDoughnutInstance.current.destroy();
      if (chartBarComparativoInstance.current) chartBarComparativoInstance.current.destroy();
    };
  }, [filteredPosts, totals, platformFilter]);

  const handleResetFilters = () => {
    setPlatformFilter('all');
    setDateFilter('all');
    setSearchQuery('');
    setSortBy('data');
  };

  const handleCopyCsv = () => {
    const headers = 'Plataforma,Data,Dia,Grupo,Formato,Alcance,Impressões,Interações,Curtidas,Comentários,Envios,Cliques Link,Salvos,Engajamento';
    const rows = CAMPAIGN_POSTS.map(p => 
      `"${p.plataforma}","${p.dataDisplay}","${p.diaSemana}","${p.grupo}","${p.formato || ''}",${p.alcance},${p.impressoes},${p.interacoes},${p.curtidas},${p.comentarios},${p.compartilhamentos},${p.cliquesLink || 0},${p.salvos || 0},"${p.engajamento}%"`
    );
    const csvContent = [headers, ...rows].join('\n');
    navigator.clipboard.writeText(csvContent).then(() => {
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2500);
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900 pb-12 font-sans">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 pt-6 sm:pt-8 space-y-6">

        {/* 1. HEADER SUPERIOR */}
        <header className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 transition-all duration-200">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            
            {/* Logos & Título */}
            <div className="space-y-3">
              <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
                {/* Lockup Oficial: Assaí Atacadista | Mega Mídia */}
                <div className="flex items-center gap-2.5 sm:gap-3.5 bg-white py-1 px-1.5 rounded-lg">
                  {/* Logo Assaí Atacadista */}
                  <img
                    src="/assai-logo.svg"
                    alt="Logo Assaí Atacadista"
                    className="h-10 sm:h-12 w-auto object-contain max-w-[145px]"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const fallback = document.getElementById('clientLogoFallback');
                      if (fallback) fallback.style.display = 'inline-flex';
                    }}
                  />
                  <span id="clientLogoFallback" className="hidden items-center px-2.5 py-1 rounded text-xs font-bold bg-[#005599] text-white tracking-wide">
                    ASSAÍ ATACADISTA
                  </span>

                  {/* Divisor Vertical */}
                  <div className="h-8 sm:h-10 w-px bg-slate-300"></div>

                  {/* Novo Símbolo Oficial Mega Mídia (M Colorido) */}
                  <img
                    src="/megamidia-m.png"
                    alt="Logo Mega Mídia - Símbolo Oficial"
                    className="h-9 sm:h-11 w-auto object-contain max-w-[50px] drop-shadow-2xs"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                      const fallback = document.getElementById('agencyLogoFallback');
                      if (fallback) fallback.style.display = 'inline-flex';
                    }}
                  />
                  <span id="agencyLogoFallback" className="hidden items-center px-2 py-0.5 rounded text-xs font-bold bg-slate-800 text-white tracking-wide">
                    MEGA MÍDIA
                  </span>
                </div>

                {/* Tag de Contexto Atualizada */}
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-[#005599] border border-blue-200 shadow-2xs">
                  <span className="w-2 h-2 rounded-full bg-[#005599] animate-pulse"></span>
                  Base Oficial Atualizada: (01 a 27/10/2026)
                </span>
              </div>

              <div>
                <h1 className="text-xl sm:text-2xl font-extrabold text-[#005599] tracking-tight">
                  DASHBOARD: Campanha de Aniversário 2026
                </h1>
                <p className="text-xs text-slate-500 mt-1 flex items-center gap-2 flex-wrap">
                  <span>Grupo Ativo: <strong className="text-slate-700">ANIVERSÁRIO ASSAÍ 2026</strong></span>
                  <span>·</span>
                  <span>Período: <strong className="text-slate-700">01 a 27/10/2026</strong></span>
                  <span>·</span>
                  <span>Canais: <strong className="text-slate-700">Instagram Feed, Stories, Facebook e TikTok</strong></span>
                </p>
              </div>
            </div>

            {/* Botões Rápidos */}
            <div className="flex items-center gap-2 self-start md:self-center shrink-0 no-print">
              <button
                onClick={() => {
                  document.getElementById('sectionPosts')?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold text-[#005599] bg-[#EBF4FA] hover:bg-[#dbeafe] transition-colors cursor-pointer"
              >
                <Layers className="w-4 h-4" />
                <span>Ver {filteredPosts.length} Posts (Base)</span>
              </button>
              <button
                onClick={() => setIsCsvModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold text-slate-600 bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer"
              >
                <FileSpreadsheet className="w-4 h-4 text-[#005599]" />
                <span>CSV Base ({totals.totalPosts})</span>
              </button>
            </div>
          </div>

          {/* Linha de Filtros Lado a Lado */}
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider shrink-0">
              <Filter className="w-4 h-4 text-slate-400" />
              <span>Filtros:</span>
            </div>

            {/* Dropdown Período */}
            <div className="flex-1">
              <label htmlFor="filterPeriodo" className="sr-only">Período</label>
              <select
                id="filterPeriodo"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#005599] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">Todo o Período: Campanha de Aniversário (01 a 27/10/2026)</option>
                <option value="2026-10-01">01/10/2026 · Quinta-feira (Lançamento Oficial)</option>
                <option value="2026-10-02">02/10/2026 · Sexta-feira</option>
                <option value="2026-10-03">03/10/2026 · Sábado</option>
                <option value="2026-10-04">04/10/2026 · Domingo</option>
                <option value="2026-10-05">05/10/2026 · Segunda-feira (Especial PJ)</option>
                <option value="2026-10-06">06/10/2026 · Terça-feira (Dia de Festa e Feira)</option>
                <option value="2026-10-07">07/10/2026 · Quarta-feira (Super Ofertas)</option>
                <option value="2026-10-08">08/10/2026 · Quinta-feira (Facilidade / Ofertas)</option>
                <option value="2026-10-09">09/10/2026 · Sexta-feira (Economizasso / Institucional)</option>
                <option value="2026-10-10">10/10/2026 · Sábado (Ganhadores & Baratasso)</option>
                <option value="2026-10-11">11/10/2026 · Domingo (Três Coisas / Mecânica)</option>
                <option value="2026-10-12">12/10/2026 · Segunda-feira (Dia das Crianças / Economizasso)</option>
                <option value="2026-10-13">13/10/2026 · Terça-feira (Perfis Fakes / Ganhadores)</option>
                <option value="2026-10-14">14/10/2026 · Quarta-feira (Vantagens MP / Prêmios)</option>
                <option value="2026-10-15">15/10/2026 · Quinta-feira (Ganhadores / Segurança / Disputa)</option>
                <option value="2026-10-16">16/10/2026 · Sexta-feira (Como Saber se Ganhei / Prêmios)</option>
                <option value="2026-10-17">17/10/2026 · Sábado (Ofertas Urgentes / Mecânica e Aceleradores)</option>
                <option value="2026-10-18">18/10/2026 · Domingo (Confira os Ganhadores / Venha Aproveitar)</option>
                <option value="2026-10-19">19/10/2026 · Segunda-feira (Ofertas Hardsell / Passaí / Aceleradores)</option>
                <option value="2026-10-20">20/10/2026 · Terça-feira (Carrinho Cheio / Achadinhos MP / Aceleradores)</option>
                <option value="2026-10-21">21/10/2026 · Quarta-feira (Trend Carro / iFood / Tour pela Loja)</option>
                <option value="2026-10-22">22/10/2026 · Quinta-feira (Coooorre / App Meu Assaí / 1 Milhão)</option>
                <option value="2026-10-23">23/10/2026 · Sexta-feira (Ofertas + Prêmios / Divulgação Revista)</option>
                <option value="2026-10-24">24/10/2026 · Sábado (Aniversário 52 Anos Faro / Ainda Dá Tempo)</option>
                <option value="2026-10-25">25/10/2026 · Domingo (Confira os Ganhadores / Praticidade MP)</option>
                <option value="2026-10-26">26/10/2026 · Segunda-feira (Perfis Fakes / Hora do Lanche / Se Você se Perdesse)</option>
                <option value="2026-10-27">27/10/2026 · Terça-feira (Interativo Prêmios / Passaí / Ainda Dá Tempo PJ)</option>
              </select>
            </div>

            {/* Dropdown Redes Sociais */}
            <div className="flex-1">
              <label htmlFor="filterRede" className="sr-only">Redes Sociais</label>
              <select
                id="filterRede"
                value={platformFilter}
                onChange={(e) => setPlatformFilter(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 text-slate-700 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-[#005599] focus:bg-white transition-colors cursor-pointer"
              >
                <option value="all">Redes Sociais (Todas as 4 Redes · {totals.totalPosts} Posts)</option>
                <option value="Instagram Feed">Instagram Feed (43 Posts · 26 Reels, 15 Carrosséis e 2 Estáticos)</option>
                <option value="Instagram Stories">Instagram Stories (297 Stories)</option>
                <option value="Facebook">Facebook (34 Posts · 14 Estáticos, 11 Carrosséis e 9 Vídeos)</option>
                <option value="Tiktok">TikTok (33 Vídeos Curtos)</option>
              </select>
            </div>

            {/* Botão Reset Rápido */}
            <button
              onClick={handleResetFilters}
              type="button"
              title="Redefinir Filtros"
              className="text-xs text-slate-400 hover:text-[#005599] font-medium px-2 py-1 transition-colors self-end sm:self-center cursor-pointer"
            >
              Limpar
            </button>
          </div>
        </header>

        {/* 2. CARDS DE KPI (Visão Geral) */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4" aria-label="Indicadores Chave">
          {/* Card 1: TOTAL DE IMPACTOS */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-blue-100 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                TOTAL DE IMPACTOS
              </span>
              <div className="w-9 h-9 rounded-lg bg-[#EBF4FA] text-[#005599] flex items-center justify-center shrink-0">
                <Eye className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatNumber(totals.impressoes)}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                <Users className="w-3.5 h-3.5 mr-0.5 inline" />
                {formatNumber(totals.alcance)} Alcance
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Total consolidado de impressões e visualizações
            </p>
          </div>

          {/* Card 2: TOTAL DE INTERAÇÕES */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-orange-100 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                TOTAL DE INTERAÇÕES
              </span>
              <div className="w-9 h-9 rounded-lg bg-[#FEF3EB] text-[#F47920] flex items-center justify-center shrink-0">
                <Heart className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {formatNumber(totals.interacoes)}
              </span>
              <span className="inline-flex items-center text-xs font-bold text-[#F47920] bg-orange-50 px-2 py-0.5 rounded">
                <Heart className="w-3.5 h-3.5 mr-0.5 inline" />
                {formatNumber(totals.curtidas)} curtidas
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              {formatNumber(totals.cliquesLink)} cliques · {formatNumber(totals.compartilhamentos)} envios · {formatNumber(totals.comentarios)} coments
            </p>
          </div>

          {/* Card 3: ENGAJAMENTO MÉDIO (ER) - Estilizado sem cor verde */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:border-blue-100 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 tracking-wider uppercase">
                ENGAJAMENTO MÉDIO (ER)
              </span>
              <div className="w-9 h-9 rounded-lg bg-blue-50 text-[#005599] flex items-center justify-center shrink-0">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight tabular-nums">
                {totals.erMedioRedes.toFixed(2).replace('.', ',')}%
              </span>
              <span className="inline-flex items-center text-xs font-bold text-[#005599] bg-blue-50 border border-blue-100 px-2 py-0.5 rounded">
                <TrendingUp className="w-3.5 h-3.5 mr-0.5 inline" />
                Média 4 Redes
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Média das 4 redes ({platformStats.map(p => `${p.plataforma.replace('Instagram ', '')} ${p.er.toFixed(2).replace('.', ',')}%`).join(' · ')})
            </p>
          </div>
        </section>

        {/* FAIXA DETALHADA DE INTERAÇÕES */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-5">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
            Detalhamento de Interações da Base ({formatNumber(totals.interacoes)} Ações Registradas)
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-center">
            {/* Curtidas */}
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                <span>❤️ Curtidas</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
                {formatNumber(totals.curtidas)}
              </div>
              <div className="text-[10px] text-slate-400">
                {totals.interacoes > 0 ? ((totals.curtidas / totals.interacoes) * 100).toFixed(1) : 0}% do total
              </div>
            </div>

            {/* Cliques no Link */}
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                <span>🔗 Cliques Link</span>
              </div>
              <div className="text-lg font-extrabold text-[#005599] tabular-nums mt-0.5">
                {formatNumber(totals.cliquesLink)}
              </div>
              <div className="text-[10px] text-slate-400">
                {totals.interacoes > 0 ? ((totals.cliquesLink / totals.interacoes) * 100).toFixed(1) : 0}% (Stories)
              </div>
            </div>

            {/* Envios / Shares */}
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                <span>✈️ Envios / Shares</span>
              </div>
              <div className="text-lg font-extrabold text-[#F47920] tabular-nums mt-0.5">
                {formatNumber(totals.compartilhamentos)}
              </div>
              <div className="text-[10px] text-slate-400">Compartilhamentos</div>
            </div>

            {/* Comentários */}
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                <span>💬 Comentários</span>
              </div>
              <div className="text-lg font-extrabold text-slate-900 tabular-nums mt-0.5">
                {formatNumber(totals.comentarios)}
              </div>
              <div className="text-[10px] text-slate-400">Feed, FB e TikTok</div>
            </div>

            {/* Salvos */}
            <div className="bg-gray-50 rounded-lg p-2.5 border border-gray-100 col-span-2 sm:col-span-1">
              <div className="text-[11px] font-semibold text-slate-500 uppercase flex items-center justify-center gap-1">
                <span>🔖 Salvos</span>
              </div>
              <div className="text-lg font-extrabold text-slate-800 tabular-nums mt-0.5">
                {formatNumber(totals.salvos)}
              </div>
              <div className="text-[10px] text-slate-400">Feed Instagram</div>
            </div>
          </div>
        </section>

        {/* 3. VISÃO CONSOLIDADA POR REDE SOCIAL (Tabela Dinâmica sem cor verde nos ERs) */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print-break-inside-avoid">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-[#005599] tracking-tight">
                Visão Consolidada por Rede Social (01 a 27/10/2026)
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Métricas oficiais por canal na Campanha de Aniversário 2026 ({totals.totalPosts} Publicações)
              </p>
            </div>
            <span className="text-xs font-semibold text-slate-500 bg-gray-100 px-2.5 py-1 rounded-md hidden sm:inline">
              Base Consolidada Oficial
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" id="tableRedes">
              <thead>
                <tr className="bg-gray-50/80 text-xs font-bold uppercase text-slate-500 border-b border-gray-100 tracking-wider">
                  <th scope="col" className="py-3 px-5 sm:px-6">Rede</th>
                  <th scope="col" className="py-3 px-4 text-right">Alcance</th>
                  <th scope="col" className="py-3 px-4 text-right">Impactos (Impressões)</th>
                  <th scope="col" className="py-3 px-4 text-right">Interações</th>
                  <th scope="col" className="py-3 px-5 sm:px-6 text-right">ER Médio</th>
                </tr>
              </thead>
              <tbody id="tbodyRedes" className="divide-y divide-gray-100 font-medium text-slate-700">
                {platformStats.map((item) => {
                  const isFeed = item.plataforma === 'Instagram Feed';
                  const isStories = item.plataforma === 'Instagram Stories';
                  const isFb = item.plataforma === 'Facebook';
                  const isTt = item.plataforma === 'Tiktok';

                  return (
                    <tr 
                      key={item.plataforma}
                      onClick={() => setPlatformFilter(platformFilter === item.plataforma ? 'all' : item.plataforma)}
                      className={`hover:bg-gray-50/60 transition-colors cursor-pointer ${
                        platformFilter === item.plataforma ? 'bg-blue-50/40' : ''
                      }`}
                    >
                      <td className="py-3.5 px-5 sm:px-6 flex items-center gap-3">
                        {isStories ? (
                          <div className="w-7 h-7 rounded-full p-0.5 bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 flex items-center justify-center shrink-0 shadow-xs">
                            <div className="w-full h-full rounded-full bg-white flex items-center justify-center text-pink-600">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <circle cx="12" cy="12" r="9" strokeWidth="2" strokeDasharray="4 2" />
                                <polygon points="10 8 16 12 10 16 10 8" fill="currentColor" stroke="none" />
                              </svg>
                            </div>
                          </div>
                        ) : isFeed ? (
                          <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-yellow-500 via-pink-500 to-purple-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                          </div>
                        ) : isFb ? (
                          <div className="w-7 h-7 rounded-full bg-[#1877F2] text-white flex items-center justify-center shrink-0 shadow-xs">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 003 15.68 6.34 6.34 0 009.34 22a6.34 6.34 0 006.34-6.32V9.32a8.3 8.3 0 005-1.63v-3.7a8.2 8.2 0 01-1.09-.3z"/></svg>
                          </div>
                        )}
                        <div>
                          <span className="font-bold text-slate-800">{item.plataforma}</span>
                          <span className="block text-[11px] text-slate-500 font-medium">
                            {isStories 
                              ? `${item.postsCount} Stories · ${formatNumber(item.cliquesLink || 0)} cliques link` 
                              : isFeed 
                              ? `${item.postsCount} Posts (26 Reels, 15 Carrosséis, 2 Estáticos)` 
                              : isFb 
                              ? `${item.postsCount} Publicações (14 Estáticos, 11 Carrosséis, 9 Vídeos)` 
                              : `${item.postsCount} Vídeos Curtos de Ofertas`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-700 font-semibold">{formatNumber(item.alcance)}</td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-slate-900 font-bold">{formatNumber(item.impressoes)}</td>
                      <td className="py-3.5 px-4 text-right tabular-nums text-[#F47920] font-bold">{formatNumber(item.interacoes)}</td>
                      <td className="py-3.5 px-5 sm:px-6 text-right">
                        {/* ER estilizado em azul/neutro sem verde */}
                        <span className="inline-block px-2.5 py-1 rounded bg-blue-50 text-blue-900 font-bold tabular-nums border border-blue-100">
                          {item.er.toFixed(2).replace('.', ',')}%
                        </span>
                        <span className="block text-[10px] text-slate-400 mt-0.5 tabular-nums">
                          Pond: {item.erPonderado.toFixed(2).replace('.', ',')}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              {/* Linha Total Consolidada */}
              <tfoot>
                <tr className="bg-gray-50/90 font-bold text-slate-900 border-t border-gray-200">
                  <td className="py-3.5 px-5 sm:px-6 text-[#005599]">Total Oficial / Média das 4 Redes</td>
                  <td className="py-3.5 px-4 text-right tabular-nums text-slate-800">{formatNumber(totals.alcance)}</td>
                  <td className="py-3.5 px-4 text-right tabular-nums text-[#005599]">{formatNumber(totals.impressoes)}</td>
                  <td className="py-3.5 px-4 text-right tabular-nums text-[#F47920]">{formatNumber(totals.interacoes)}</td>
                  <td className="py-3.5 px-5 sm:px-6 text-right tabular-nums text-[#005599] font-extrabold">
                    <div>{totals.erMedioRedes.toFixed(2).replace('.', ',')}%</div>
                    <span className="block text-[10px] text-slate-500 font-normal tabular-nums">
                      Pond: {totals.erPonderado.toFixed(2).replace('.', ',')}%
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>

        {/* 4. GRÁFICO 1: PERFORMANCE COMPARATIVA DOS CANAIS */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-6 print-break-inside-avoid">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-base sm:text-lg font-bold text-[#005599] tracking-tight">
                Performance Comparativa dos Canais (Campanha de Aniversário 2026)
              </h2>
              <p className="text-xs text-slate-500">
                Comparativo de Impactos (Impressões), Alcance Único e Total de Interações por plataforma
              </p>
            </div>
            {/* Legenda de Cores Manual/Explícita */}
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-[#005599]"></span> Impressões
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-[#38bdf8]"></span> Alcance
              </span>
              <span className="inline-flex items-center gap-1.5 text-slate-700">
                <span className="w-3 h-3 rounded-xs bg-[#F47920]"></span> Interações
              </span>
            </div>
          </div>

          {/* Gráfico 1 Canvas */}
          <div className="relative w-full h-72 sm:h-80">
            <canvas ref={chartStackedRef}></canvas>
          </div>

          {/* Tabela abaixo do gráfico sincronizada */}
          <div className="border-t border-gray-100 pt-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Detalhamento Consolidado por Canal
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="bg-gray-50/70 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-gray-100">
                    <th scope="col" className="py-2.5 px-4">Canal / Formato</th>
                    <th scope="col" className="py-2.5 px-4 text-right">Alcance</th>
                    <th scope="col" className="py-2.5 px-4 text-right">Impactos (Impressões)</th>
                    <th scope="col" className="py-2.5 px-4 text-right">Interações</th>
                    <th scope="col" className="py-2.5 px-4 text-right">ER Médio</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium text-slate-700">
                  {platformStats.map(item => (
                    <tr key={`detail-${item.plataforma}`} className="hover:bg-blue-50/20 transition-colors">
                      <td className="py-2.5 px-4 flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          item.plataforma === 'Instagram Feed' ? 'bg-[#005599]' :
                          item.plataforma === 'Instagram Stories' ? 'bg-purple-600' :
                          item.plataforma === 'Facebook' ? 'bg-[#1877F2]' : 'bg-black'
                        }`}></span>
                        <span className="font-semibold text-slate-900">{item.plataforma}</span>
                        <span className="text-xs text-slate-500 font-normal">
                          ({item.postsCount} posts)
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-slate-600">{formatNumber(item.alcance)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-[#005599] font-bold">{formatNumber(item.impressoes)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums text-[#F47920] font-bold">{formatNumber(item.interacoes)}</td>
                      <td className="py-2.5 px-4 text-right tabular-nums font-bold text-blue-900 bg-blue-50/50 rounded">
                        {item.er.toFixed(2).replace('.', ',')}%
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* 5. EQUILÍBRIO EDITORIAL & MATRIZ ESFORÇO VS. RESULTADO */}
        <section className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 sm:p-6 space-y-6 print-break-inside-avoid">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-base sm:text-lg font-bold text-[#005599] tracking-tight">
              Equilíbrio Editorial & Matriz Esforço vs. Resultado
            </h2>
            <p className="text-xs text-slate-500">
              Avaliação de eficiência de cada canal: proporção de impactos gerados versus volume de engajamento conquistado
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            {/* Gráfico 2 (Esquerda): Gráfico de Rosca */}
            <div className="flex flex-col items-center">
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center">
                Composição das {formatNumber(totals.interacoes)} Interações
              </h3>
              <div className="relative w-64 h-64 sm:w-72 sm:h-72">
                <canvas ref={chartDoughnutRef}></canvas>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5 text-xs text-slate-600">
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#F47920]"></span> Curtidas: <strong className="text-slate-900">{((totals.curtidas / totals.interacoes) * 100).toFixed(1)}%</strong>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#005599]"></span> Cliques Link: <strong className="text-slate-900">{((totals.cliquesLink / totals.interacoes) * 100).toFixed(1)}%</strong>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#38bdf8]"></span> Envios: <strong className="text-slate-900">{((totals.compartilhamentos / totals.interacoes) * 100).toFixed(1)}%</strong>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1]"></span> Comentários: <strong className="text-slate-900">{((totals.comentarios / totals.interacoes) * 100).toFixed(1)}%</strong>
                </div>
              </div>
            </div>

            {/* Gráfico 3 (Direita): Gráfico de Barras Agrupadas */}
            <div>
              <h3 className="text-xs font-bold text-slate-600 uppercase tracking-wider mb-2 text-center md:text-left">
                Comparativo: % Impactos vs. % Interações por Plataforma
              </h3>
              <div className="relative w-full h-64 sm:h-72">
                <canvas ref={chartBarComparativoRef}></canvas>
              </div>
              {/* Insight Box Oficial */}
              <div className="mt-3 p-3 bg-blue-50/70 border border-blue-100 rounded-lg text-xs text-slate-700 leading-relaxed">
                <span className="font-bold text-[#005599]">Insight de Eficiência:</span>{' '}
                O <strong>Instagram Feed</strong> concentrou expressivo volume de impactos (<strong>7.423.675</strong>) e interações (<strong>262.596 com 232.593 curtidas</strong> em 43 posts), sustentando taxa ponderada de <strong>4,95%</strong>. O <strong>Instagram Stories</strong> segue como o grande motor de tráfego qualificado alcançando <strong>69.746 cliques no link</strong> em 297 stories (com picos de 6.699 cliques em Passaí, <strong>5.632 cliques / 18,92% ER</strong> em Ofertas que te dão Prêmios e <strong>4.018 cliques / 12,28% ER</strong> em 26/10). O <strong>Facebook</strong> consolidou 527.164 impactos e 7.897 interações em 34 publicações (<strong>2,01%</strong> ponderado), e o <strong>TikTok</strong> registrou <strong>2,93%</strong> de taxa ponderada (<strong>3,03%</strong> média) nos 33 vídeos curtos.
              </div>
            </div>
          </div>
        </section>

        {/* 6. TABELA COMPLETA COM AS 407 PUBLICAÇÕES */}
        <section id="sectionPosts" className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden print-break-inside-avoid">
          <div className="px-5 sm:px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#005599]" />
                <h2 className="text-base font-bold text-[#005599] tracking-tight">
                  Base de Dados: Todas as {CAMPAIGN_POSTS.length} Publicações da Campanha ({filteredPosts.length})
                </h2>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                Registros individuais cadastrados na Campanha de Aniversário 2026 (01 a 27/10/2026)
              </p>
            </div>

            {/* Ordenação */}
            <div className="flex items-center gap-2 self-start sm:self-auto text-xs">
              <span className="text-slate-400 font-medium">Ordenar:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="bg-gray-50 border border-gray-200 text-slate-700 text-xs font-semibold rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-[#005599]"
              >
                <option value="data">Data de Publicação</option>
                <option value="impressoes">Maior Impacto (Impressões)</option>
                <option value="interacoes">Mais Interações</option>
                <option value="engajamento">Maior Taxa de Engajamento</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm" id="tablePosts">
              <thead>
                <tr className="bg-gray-50/80 text-[11px] font-bold uppercase text-slate-500 border-b border-gray-100 tracking-wider">
                  <th scope="col" className="py-3 px-4 sm:px-6">Publicação & Formato</th>
                  <th scope="col" className="py-3 px-3">Data / Dia</th>
                  <th scope="col" className="py-3 px-3 text-right">Alcance</th>
                  <th scope="col" className="py-3 px-3 text-right">Impactos (Impressões)</th>
                  <th scope="col" className="py-3 px-4 text-right">Interações & Ações</th>
                  <th scope="col" className="py-3 px-3 text-right">Taxa ER</th>
                  <th scope="col" className="py-3 px-4 text-center no-print">Link</th>
                </tr>
              </thead>
              <tbody id="tbodyPosts" className="divide-y divide-gray-100 font-medium text-slate-700">
                {filteredPosts.map((post) => {
                  const isStories = post.plataforma === 'Instagram Stories';
                  const isFeed = post.plataforma === 'Instagram Feed';
                  const isFb = post.plataforma === 'Facebook';

                  return (
                    <tr key={post.id} className="hover:bg-blue-50/30 transition-colors">
                      {/* Plataforma */}
                      <td className="py-3 px-4 sm:px-6">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            isFeed ? 'bg-[#005599]' : isStories ? 'bg-purple-600' : isFb ? 'bg-blue-600' : 'bg-slate-900'
                          }`}></span>
                          <div>
                            <span className="font-bold text-slate-900 block text-xs sm:text-sm">
                              {post.plataforma}
                            </span>
                            <span className="text-[11px] text-slate-400 block">
                              {post.formato || post.tipo || 'Post'} · {post.grupo}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Data */}
                      <td className="py-3 px-3 text-xs whitespace-nowrap">
                        <span className="font-semibold text-slate-800 block">
                          {post.dataDisplay}
                          {post.horario && <span className="text-[10px] text-slate-400 font-normal ml-1">· {post.horario}</span>}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize block">{post.diaSemana}</span>
                      </td>

                      {/* Alcance */}
                      <td className="py-3 px-3 text-right tabular-nums text-slate-700 font-semibold text-xs sm:text-sm">
                        {formatNumber(post.alcance)}
                      </td>

                      {/* Impressões */}
                      <td className="py-3 px-3 text-right tabular-nums text-slate-900 font-bold text-xs sm:text-sm">
                        {formatNumber(post.impressoes)}
                      </td>

                      {/* Interações */}
                      <td className="py-3 px-4 text-right tabular-nums">
                        <span className="font-extrabold text-[#F47920] block text-xs sm:text-sm">
                          {formatNumber(post.interacoes)}
                        </span>
                        <span className="text-[10px] text-slate-400 block whitespace-nowrap">
                          {isStories ? (
                            <span title={`Cliques: ${post.cliquesLink || 0} | Curtidas: ${post.curtidas} | Visitas ao Perfil: ${post.visitasPerfil || 0} | Respostas: ${post.respostas || 0} | Envios: ${post.compartilhamentos || 0}`}>
                              {post.cliquesLink ? `${formatNumber(post.cliquesLink)} cliques · ` : ''}
                              {`${post.curtidas} curt`}
                              {post.visitasPerfil ? ` · ${formatNumber(post.visitasPerfil)} perfil` : ''}
                              {((post.respostas || 0) + (post.compartilhamentos || 0) > 0) ? ` · ${(post.respostas || 0) + (post.compartilhamentos || 0)} resp/env` : ''}
                            </span>
                          ) : isFb ? (
                            `${formatNumber(post.curtidas)} curt · ${formatNumber(post.comentarios)} com`
                          ) : (
                            `${formatNumber(post.curtidas)} curt · ${post.compartilhamentos} env · ${post.comentarios} com`
                          )}
                        </span>
                      </td>

                      {/* ER - Estilizado em azul institucional sem verde */}
                      <td className="py-3 px-3 text-right">
                        <span className="inline-block px-2 py-0.5 rounded text-xs font-bold tabular-nums bg-blue-50 text-blue-900 border border-blue-100">
                          {post.engajamento.toFixed(2).replace('.', ',')}%
                        </span>
                      </td>

                      {/* Link */}
                      <td className="py-3 px-4 text-center no-print">
                        {post.link ? (
                          <a
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#005599] hover:underline"
                            title="Abrir post original"
                          >
                            <span>Abrir</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ) : (
                          <span className="text-[11px] text-slate-300">-</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* 7. FOOTER */}
        <footer className="pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 no-print">
          <div className="flex items-center gap-2">
            <span className="font-bold text-[#005599]">ASSAÍ ATACADISTA</span>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <img src="/megamidia-m.png" alt="Mega Mídia" className="w-3.5 h-3.5 object-contain inline" />
              <span>Mega Mídia Group</span>
            </span>
            <span>·</span>
            <span>Campanha de Aniversário 2026 (01 a 27/10/2026) · Monitoramento Oficial</span>
          </div>
          <div className="flex items-center gap-4 font-semibold">
            <button
              onClick={() => setIsGlossaryModalOpen(true)}
              className="text-slate-600 hover:text-[#005599] transition-colors underline decoration-slate-300 underline-offset-4 cursor-pointer"
            >
              Glossário
            </button>
            <span>·</span>
            <button
              onClick={() => window.print()}
              className="text-[#F47920] hover:text-[#d9630e] transition-colors font-bold underline decoration-orange-300 underline-offset-4 cursor-pointer"
            >
              Exportar Relatório PDF
            </button>
          </div>
        </footer>

      </div>

      {/* MODAL 1: CSV / PLANILHA */}
      {isCsvModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-xl w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="p-2 rounded-lg bg-[#EBF4FA] text-[#005599]">
                  <FileSpreadsheet className="w-5 h-5" />
                </span>
                <h3 className="text-base font-bold text-slate-900">
                  Base de Dados Oficial: Campanha de Aniversário 2026
                </h3>
              </div>
              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-500">
              {totals.totalPosts} publicações consolidadas cobrindo Instagram Feed, Instagram Stories, Facebook e TikTok (01/10 a 27/10/2026).
            </p>

            <div className="bg-slate-900 text-slate-200 p-3.5 rounded-lg text-[11px] font-mono overflow-x-auto max-h-48 leading-relaxed">
              <div className="text-blue-400 font-bold mb-1"># Resumo da Base Oficial Consolidada:</div>
              Total de Publicações: {totals.totalPosts}<br />
              Total de Impactos: {formatNumber(totals.impressoes)}<br />
              Total de Alcance: {formatNumber(totals.alcance)}<br />
              Total de Interações: {formatNumber(totals.interacoes)}<br />
              Engajamento Médio das 4 Redes: {totals.erMedioRedes.toFixed(2).replace('.', ',')}%<br />
              Cliques no Link (Stories): {formatNumber(totals.cliquesLink)}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={handleCopyCsv}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg bg-gray-100 hover:bg-gray-200 text-slate-700 transition-colors cursor-pointer"
              >
                {copyFeedback ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 text-blue-600" />
                    <span className="text-blue-700 font-bold">CSV Copiado com Sucesso!</span>
                  </>
                ) : (
                  <>
                    <Share2 className="w-4 h-4" />
                    <span>Copiar CSV Completo ({CAMPAIGN_POSTS.length} Registros)</span>
                  </>
                )}
              </button>

              <button
                onClick={() => setIsCsvModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#005599] hover:bg-[#004278] rounded-lg transition-colors cursor-pointer shadow-xs"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: GLOSSÁRIO */}
      {isGlossaryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 no-print">
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 max-w-lg w-full p-6 space-y-4 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <h3 className="text-lg font-bold text-[#005599]">
                Glossário de Métricas & Conceitos Oficiais
              </h3>
              <button
                onClick={() => setIsGlossaryModalOpen(false)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold p-1 rounded-lg cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 max-h-80 overflow-y-auto pr-1">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Impactos (Impressões)</h4>
                <p>Número total de vezes que as publicações, vídeos e stories foram exibidos aos usuários ({formatNumber(totals.impressoes)} impactos no consolidado de 01 a 27/10).</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Alcance Consolidado</h4>
                <p>Volume total de contas únicas alcançadas somando todas as plataformas ({formatNumber(totals.alcance)} contas únicas).</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Total de Interações</h4>
                <p>Soma de {formatNumber(totals.curtidas)} curtidas/reações, {formatNumber(totals.cliquesLink)} cliques no link, {formatNumber(totals.compartilhamentos)} compartilhamentos/envios, {formatNumber(totals.comentarios)} comentários e {formatNumber(totals.salvos)} salvos ({formatNumber(totals.interacoes)} interações totais).</p>
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Engajamento Médio das 4 Redes</h4>
                <p>Média aritmética oficial calculada entre as taxas de engajamento de cada canal: <code className="bg-gray-100 px-1 py-0.5 rounded font-mono text-slate-800">({platformStats.map(p => `${p.er.toFixed(2).replace('.', ',')}%`).join(' + ')}) / 4</code> = <strong>{totals.erMedioRedes.toFixed(2).replace('.', ',')}%</strong> (taxa ponderada global de <strong>{totals.erPonderado.toFixed(2).replace('.', ',')}%</strong>).</p>
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setIsGlossaryModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#005599] hover:bg-[#004278] rounded-lg transition-colors cursor-pointer"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
