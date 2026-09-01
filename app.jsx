import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, Sword, User, Map, Store, Zap, Heart, Activity, 
  Coins, ArrowUp, ShoppingBag, Backpack, MapPin, Skull, Save, Play, X, Sun, Moon, Cloud
} from 'lucide-react';

// --- ゲームデータ定義 ---

const AVATARS = ['😊', '😎', '🤠', '🥷', '🧙‍♂️', '🧛‍♂️', '🤖', '🐱'];

const INITIAL_ITEMS = {
  weapon: { id: 'w_knife', name: '木のナイフ', type: 'weapon', atk: 1, def: 0, agi: 0, price: 50, desc: '初期装備のナイフ' },
  armor: { id: 'a_jersey', name: 'ジャージ', type: 'armor', atk: 0, def: 1, agi: 0, price: 50, desc: '動きやすい服' },
  shoes: { id: 's_shoes', name: '運動靴', type: 'shoes', atk: 0, def: 1, agi: 1, price: 50, desc: '普通の靴' }
};

const SHOP_ITEMS = [
  { id: 'i_potion', name: '傷薬', type: 'item', healHp: 50, price: 50, desc: 'HPを50回復' },
  { id: 'i_potion_hi', name: '上傷薬', type: 'item', healHp: 150, price: 150, desc: 'HPを150回復' },
  { id: 'w_sword_iron', name: '鉄の剣', type: 'weapon', atk: 5, def: 0, agi: 0, price: 300, desc: '攻撃+5' },
  { id: 'w_sword_steel', name: '鋼の剣', type: 'weapon', atk: 12, def: 0, agi: 0, price: 800, desc: '攻撃+12' },
  { id: 'w_axe_battle', name: '戦斧', type: 'weapon', atk: 18, def: 0, agi: -2, price: 1500, desc: '攻撃+18, 速さ-2' },
  { id: 'a_leather', name: '皮の鎧', type: 'armor', atk: 0, def: 5, agi: 0, price: 300, desc: '防御+5' },
  { id: 'a_chain', name: '鎖帷子', type: 'armor', atk: 0, def: 10, agi: -1, price: 750, desc: '防御+10, 速さ-1' },
  { id: 'a_plate', name: 'プレートメイル', type: 'armor', atk: 0, def: 18, agi: -3, price: 1600, desc: '防御+18, 速さ-3' },
  { id: 's_leather', name: '革の靴', type: 'shoes', atk: 0, def: 1, agi: 3, price: 200, desc: '防御+1, 速さ+3' },
  { id: 's_boots', name: '鉄のブーツ', type: 'shoes', atk: 0, def: 4, agi: -1, price: 400, desc: '防御+4, 速さ-1' },
];

// スキル種類の拡充
const SKILLS_DATA = {
  'heavy_strike': { name: '強撃', type: 'attack', mpCost: 3, multiplier: 1.5, desc: '威力1.5倍の物理攻撃' },
  'double_slash': { name: '二連斬り', type: 'attack_multi', mpCost: 5, multiplier: 0.8, hits: 2, desc: '威力0.8倍の2回連続攻撃' },
  'fatal_blow': { name: '鬼神の一撃', type: 'attack', mpCost: 12, multiplier: 2.5, desc: '威力2.5倍の強力な物理攻撃' },
  'heal_light': { name: '治癒', type: 'heal', mpCost: 5, healHp: 60, desc: 'HPを60回復' },
  'heal_mid': { name: '中治癒', type: 'heal', mpCost: 12, healHp: 150, desc: 'HPを150回復' },
  'fireball': { name: '火球', type: 'magic', mpCost: 6, multiplier: 1.8, desc: '敵の防御の影響を受けにくい魔法攻撃' },
  'ice_lance': { name: '氷槍', type: 'magic', mpCost: 12, multiplier: 2.8, desc: '強力な魔法攻撃' },
};

// スキルツリーの拡充
const SKILL_TREE = [
  // ステータス系 (HP)
  { id: 'hp_1', name: '体力強化I', desc: '最大HP+10', cost: 1, type: 'stat', stat: 'maxHp', val: 10, req: [] },
  { id: 'hp_2', name: '体力強化II', desc: '最大HP+25', cost: 2, type: 'stat', stat: 'maxHp', val: 25, req: ['hp_1'] },
  { id: 'hp_3', name: '体力強化III', desc: '最大HP+50', cost: 3, type: 'stat', stat: 'maxHp', val: 50, req: ['hp_2'] },
  // ステータス系 (攻撃)
  { id: 'atk_1', name: '筋力強化I', desc: '攻撃+3', cost: 1, type: 'stat', stat: 'atk', val: 3, req: [] },
  { id: 'atk_2', name: '筋力強化II', desc: '攻撃+6', cost: 2, type: 'stat', stat: 'atk', val: 6, req: ['atk_1'] },
  { id: 'atk_3', name: '筋力強化III', desc: '攻撃+10', cost: 3, type: 'stat', stat: 'atk', val: 10, req: ['atk_2'] },
  // ステータス系 (防御)
  { id: 'def_1', name: '頑強I', desc: '防御+3', cost: 1, type: 'stat', stat: 'def', val: 3, req: [] },
  { id: 'def_2', name: '頑強II', desc: '防御+6', cost: 2, type: 'stat', stat: 'def', val: 6, req: ['def_1'] },
  { id: 'def_3', name: '頑強III', desc: '防御+10', cost: 3, type: 'stat', stat: 'def', val: 10, req: ['def_2'] },
  // ステータス系 (速さ)
  { id: 'agi_1', name: '俊敏I', desc: '速さ+3', cost: 1, type: 'stat', stat: 'agi', val: 3, req: [] },
  { id: 'agi_2', name: '俊敏II', desc: '速さ+5', cost: 2, type: 'stat', stat: 'agi', val: 5, req: ['agi_1'] },
  // ステータス系 (運)
  { id: 'luk_1', name: '幸運I', desc: '運+3 (会心率UP)', cost: 1, type: 'stat', stat: 'luk', val: 3, req: [] },
  { id: 'luk_2', name: '幸運II', desc: '運+5 (会心率UP)', cost: 2, type: 'stat', stat: 'luk', val: 5, req: ['luk_1'] },
  
  // アクティブスキル
  { id: 'skill_heavy', name: 'スキル: 強撃', desc: 'MP3消費 威力1.5倍', cost: 2, type: 'skill', skillId: 'heavy_strike', req: ['atk_1'] },
  { id: 'skill_double', name: 'スキル: 二連斬り', desc: 'MP5消費 2回攻撃', cost: 4, type: 'skill', skillId: 'double_slash', req: ['skill_heavy', 'agi_1'] },
  { id: 'skill_fatal', name: 'スキル: 鬼神の一撃', desc: 'MP12消費 威力2.5倍', cost: 6, type: 'skill', skillId: 'fatal_blow', req: ['skill_double', 'atk_3'] },
  
  { id: 'skill_heal', name: 'スキル: 治癒', desc: 'MP5消費 HP60回復', cost: 2, type: 'skill', skillId: 'heal_light', req: ['hp_1'] },
  { id: 'skill_heal_m', name: 'スキル: 中治癒', desc: 'MP12消費 HP150回復', cost: 4, type: 'skill', skillId: 'heal_mid', req: ['skill_heal', 'hp_3'] },
  
  { id: 'skill_fire', name: 'スキル: 火球', desc: 'MP6消費 魔法攻撃', cost: 3, type: 'skill', skillId: 'fireball', req: ['atk_2'] },
  { id: 'skill_ice', name: 'スキル: 氷槍', desc: 'MP12消費 強力な魔法', cost: 5, type: 'skill', skillId: 'ice_lance', req: ['skill_fire'] },
];

const ENEMY_NAMES = ["スライム", "ゴブリン", "大コウモリ", "野生の狼", "オーク", "スケルトン", "リビングアーマー", "キメラ", "ドラゴンパピー", "魔王の幻影"];

// --- ユーティリティ ---
const generateId = () => Math.random().toString(36).substr(2, 9);
const randomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

// ==========================================
// メインアプリケーションコンポーネント
// ==========================================
export default function App() {
  const [gameState, setGameState] = useState('title');
  const [toastMsg, setToastMsg] = useState(null);
  const [player, setPlayer] = useState(null);
  const [battle, setBattle] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [createData, setCreateData] = useState({ name: '', avatar: AVATARS[0] });

  const logsEndRef = useRef(null);

  // トースト自動消去
  useEffect(() => {
    if (toastMsg) {
      const timer = setTimeout(() => setToastMsg(null), 2500);
      return () => clearTimeout(timer);
    }
  }, [toastMsg]);

  // 戦闘ログスクロール
  useEffect(() => {
    if (gameState === 'battle' && logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [battle?.logs]);

  const showToast = (msg) => setToastMsg(msg);

  // 現在の総合ステータスを計算
  const getStats = (currentPlayer = player) => {
    if (!currentPlayer) return null;
    let stats = { ...currentPlayer.baseStats };

    currentPlayer.unlockedNodes.forEach(nodeId => {
      const node = SKILL_TREE.find(n => n.id === nodeId);
      if (node && node.type === 'stat') {
        stats[node.stat] += node.val;
      }
    });

    ['weapon', 'armor', 'shoes'].forEach(slot => {
      const eq = currentPlayer.equipment[slot];
      if (eq) {
        stats.atk += eq.atk || 0;
        stats.def += eq.def || 0;
        stats.agi += eq.agi || 0;
      }
    });

    return stats;
  };

  const initGame = () => {
    if (!createData.name.trim()) {
      showToast('名前を入力してください');
      return;
    }

    const baseStats = {
      maxHp: randomInt(50, 100),
      maxMp: randomInt(0, 10),
      atk: randomInt(10, 15),
      def: randomInt(5, 10),
      agi: randomInt(5, 10),
      luk: randomInt(1, 10)
    };

    const w = { ...INITIAL_ITEMS.weapon, uid: generateId() };
    const a = { ...INITIAL_ITEMS.armor, uid: generateId() };
    const s = { ...INITIAL_ITEMS.shoes, uid: generateId() };

    setPlayer({
      name: createData.name,
      avatar: createData.avatar,
      level: 1,
      exp: 0,
      gold: 1000,
      sp: 10,
      territory: 0,
      baseStats,
      hp: baseStats.maxHp,
      mp: baseStats.maxMp,
      equipment: { weapon: w, armor: a, shoes: s },
      inventory: [w, a, s],
      skills: [],
      unlockedNodes: []
    });
    setGameState('main');
    showToast('冒険の準備が整った！');
  };

  const saveGame = () => {
    if (!player) return;
    localStorage.setItem('territory_rpg_save', JSON.stringify(player));
    showToast('セーブしました');
  };

  const loadGame = () => {
    const data = localStorage.getItem('territory_rpg_save');
    if (data) {
      setPlayer(JSON.parse(data));
      setGameState('main');
      showToast('ロードしました');
    } else {
      showToast('セーブデータが見つかりません');
    }
  };

  // --- 商人ロジック ---
  const isMerchantAvailable = () => {
    const hour = new Date().getHours();
    return (hour >= 7 && hour < 11) || (hour >= 15 && hour < 20);
  };

  const handleShopClick = () => {
    if (isMerchantAvailable()) {
      setGameState('shop');
    } else {
      showToast('今は商人がいないようだ...(営業: 7~10時, 15~19時)');
    }
  };

  const buyItem = (item) => {
    if (player.gold < item.price) {
      showToast('ゴールドが足りません');
      return;
    }
    let newInventory = [...player.inventory];
    if (item.type === 'item') {
      const existing = newInventory.find(i => i.id === item.id);
      if (existing) {
        existing.amount = (existing.amount || 1) + 1;
      } else {
        newInventory.push({ ...item, uid: generateId(), amount: 1 });
      }
    } else {
      newInventory.push({ ...item, uid: generateId() });
    }
    setPlayer(prev => ({
      ...prev,
      gold: prev.gold - item.price,
      inventory: newInventory
    }));
    showToast(`${item.name}を購入しました`);
  };

  // --- バトルロジック ---
  const startBattle = () => {
    const terriLevel = Math.max(1, Math.floor(player.territory / 2) + 1);
    const enemyName = ENEMY_NAMES[Math.min(terriLevel - 1, ENEMY_NAMES.length - 1)] || "謎の魔物";
    
    const enemyMaxHp = randomInt(20 + terriLevel * 15, 40 + terriLevel * 20);
    const enemy = {
      name: enemyName,
      level: terriLevel,
      maxHp: enemyMaxHp,
      hp: enemyMaxHp,
      atk: randomInt(8 + terriLevel * 3, 12 + terriLevel * 5),
      def: randomInt(2 + terriLevel * 2, 5 + terriLevel * 4),
      agi: randomInt(5 + terriLevel * 2, 10 + terriLevel * 3),
      exp: 15 + terriLevel * 8 + randomInt(0, 10),
      gold: 30 + terriLevel * 15 + randomInt(0, 20)
    };

    setBattle({
      enemy,
      logs: [`野生の${enemy.name}が現れた！`],
      isOver: false
    });
    setGameState('battle');
  };

  const processTurn = (actionType, skillData = null, itemData = null) => {
    if (battle.isOver) return;

    let newPlayer = { ...player };
    let newEnemy = { ...battle.enemy };
    let logs = [...battle.logs];
    const stats = getStats(newPlayer);

    const addLog = (msg) => logs.push(msg);

    const playerFirst = stats.agi >= newEnemy.agi;

    // ダメージ計算関数 (攻と守による計算、運による会心)
    const calculateDamage = (attackerAtk, defenderDef, attackerLuk, multiplier = 1, isMagic = false) => {
      // 会心率: 運1につき1.5%。上限50%
      const critChance = Math.min(50, attackerLuk * 1.5);
      const isCrit = randomInt(1, 100) <= critChance;
      
      // 魔法の場合は相手の防御力の影響を減らす
      const defFactor = isMagic ? Math.floor(defenderDef / 4) : Math.floor(defenderDef / 2);
      
      let dmg = Math.max(1, Math.floor(attackerAtk * multiplier) - defFactor);
      
      // 会心時はダメージ2倍
      if (isCrit) {
        dmg = Math.floor(dmg * 2);
      }
      return { dmg, isCrit };
    };

    const playerAction = () => {
      if (newPlayer.hp <= 0) return;

      if (actionType === 'attack') {
        const { dmg, isCrit } = calculateDamage(stats.atk, newEnemy.def, stats.luk);
        newEnemy.hp -= dmg;
        addLog(`あなたの攻撃！ ${newEnemy.name}に${dmg}のダメージ！${isCrit ? ' (会心!)' : ''}`);
      
      } else if (actionType === 'skill' && skillData) {
        if (newPlayer.mp < skillData.mpCost) {
          addLog(`MPが足りない！`);
          return;
        }
        newPlayer.mp -= skillData.mpCost;
        
        if (skillData.type === 'attack') {
          const { dmg, isCrit } = calculateDamage(stats.atk, newEnemy.def, stats.luk, skillData.multiplier);
          newEnemy.hp -= dmg;
          addLog(`${skillData.name}！ ${newEnemy.name}に${dmg}のダメージ！${isCrit ? ' (会心!)' : ''}`);
        
        } else if (skillData.type === 'attack_multi') {
          addLog(`${skillData.name}！`);
          for (let i = 0; i < skillData.hits; i++) {
            if (newEnemy.hp <= 0) break;
            const { dmg, isCrit } = calculateDamage(stats.atk, newEnemy.def, stats.luk, skillData.multiplier);
            newEnemy.hp -= dmg;
            addLog(` -> ${dmg}のダメージ！${isCrit ? ' (会心!)' : ''}`);
          }
        
        } else if (skillData.type === 'magic') {
          const { dmg, isCrit } = calculateDamage(stats.atk, newEnemy.def, stats.luk, skillData.multiplier, true);
          newEnemy.hp -= dmg;
          addLog(`魔法攻撃 ${skillData.name}！ ${newEnemy.name}に${dmg}のダメージ！${isCrit ? ' (魔力暴走!)' : ''}`);
        
        } else if (skillData.type === 'heal') {
          newPlayer.hp = Math.min(stats.maxHp, newPlayer.hp + skillData.healHp);
          addLog(`${skillData.name}！ HPが${skillData.healHp}回復した！`);
        }
      
      } else if (actionType === 'item' && itemData) {
        newPlayer.hp = Math.min(stats.maxHp, newPlayer.hp + itemData.healHp);
        addLog(`${itemData.name}を使った！ HPが回復した！`);
      
      } else if (actionType === 'flee') {
        const fleeSuccess = randomInt(1, 100) <= 50 + stats.agi - newEnemy.agi;
        if (fleeSuccess) {
          addLog('逃げ出すことに成功した！');
          newEnemy.hp = 0; // 強制終了用
          return true;
        } else {
          addLog('逃げられなかった！');
        }
      }
      return false;
    };

    const enemyAction = () => {
      if (newEnemy.hp <= 0) return;
      // 敵の運はレベル依存とする（少しだけ会心が出る）
      const enemyLuk = Math.min(20, newEnemy.level * 2);
      const { dmg, isCrit } = calculateDamage(newEnemy.atk, stats.def, enemyLuk);
      newPlayer.hp -= dmg;
      addLog(`${newEnemy.name}の攻撃！ あなたは${dmg}のダメージを受けた！${isCrit ? ' (痛恨の一撃!)' : ''}`);
    };

    // ターン実行
    let fled = false;
    if (playerFirst) {
      fled = playerAction();
      if (!fled) enemyAction();
    } else {
      enemyAction();
      if (newPlayer.hp > 0) fled = playerAction();
    }

    // 勝敗判定
    let isOver = false;
    if (fled) {
      isOver = true;
      setTimeout(() => { setPlayer(newPlayer); setGameState('main'); }, 1500);
    } else if (newPlayer.hp <= 0) {
      addLog('あなたは倒れてしまった...');
      isOver = true;
      newPlayer.gold = Math.floor(newPlayer.gold / 2);
      newPlayer.hp = Math.floor(stats.maxHp * 0.2);
      setTimeout(() => { 
        showToast('所持金が半分になり拠点に戻されました');
        setPlayer(newPlayer); 
        setGameState('main'); 
      }, 2000);
    } else if (newEnemy.hp <= 0) {
      addLog(`${newEnemy.name}を倒した！`);
      addLog(`${newEnemy.exp}の経験値と、${newEnemy.gold}Gを手に入れた！`);
      
      newPlayer.exp += newEnemy.exp;
      newPlayer.gold += newEnemy.gold;
      newPlayer.territory += 1; 

      let requiredExp = newPlayer.level * 20;
      while (newPlayer.exp >= requiredExp) {
        newPlayer.exp -= requiredExp;
        newPlayer.level++;
        newPlayer.sp += 10;
        
        newPlayer.baseStats.maxHp += randomInt(5, 10);
        newPlayer.baseStats.maxMp += randomInt(1, 3);
        newPlayer.baseStats.atk += randomInt(1, 3);
        newPlayer.baseStats.def += randomInt(1, 3);
        newPlayer.baseStats.agi += randomInt(1, 3);
        newPlayer.baseStats.luk += randomInt(1, 2);
        
        addLog(`レベルが${newPlayer.level}に上がった！SPを10獲得！`);
        requiredExp = newPlayer.level * 20;
      }
      
      isOver = true;
      setTimeout(() => { setPlayer(newPlayer); setGameState('main'); }, 2000);
    }

    setPlayer(newPlayer);
    setBattle({ enemy: newEnemy, logs, isOver });
  };

  const useItemInBattle = (item) => {
    let newInventory = [...player.inventory];
    const itemIndex = newInventory.findIndex(i => i.uid === item.uid);
    if (newInventory[itemIndex].amount > 1) {
      newInventory[itemIndex].amount -= 1;
    } else {
      newInventory.splice(itemIndex, 1);
    }
    setPlayer({ ...player, inventory: newInventory });
    setSelectedItem(null);
    processTurn('item', null, item);
  };

  const equipItem = (item) => {
    let newEquip = { ...player.equipment };
    newEquip[item.type] = item;
    setPlayer({ ...player, equipment: newEquip });
    showToast(`${item.name}を装備しました`);
    setSelectedItem(null);
  };

  const useItemField = (item) => {
    const stats = getStats();
    if (player.hp >= stats.maxHp) {
      showToast('HPは満タンです');
      return;
    }
    let newHp = Math.min(stats.maxHp, player.hp + item.healHp);
    
    let newInventory = [...player.inventory];
    const itemIndex = newInventory.findIndex(i => i.uid === item.uid);
    if (newInventory[itemIndex].amount > 1) {
      newInventory[itemIndex].amount -= 1;
    } else {
      newInventory.splice(itemIndex, 1);
    }
    setPlayer({ ...player, hp: newHp, inventory: newInventory });
    showToast(`${item.name}を使用し、HPが回復しました`);
    setSelectedItem(null);
  };

  const unlockSkill = (node) => {
    if (player.sp < node.cost) {
      showToast('割り振りポイント(SP)が足りません');
      return;
    }
    
    let newPlayer = { ...player };
    newPlayer.sp -= node.cost;
    newPlayer.unlockedNodes.push(node.id);

    if (node.type === 'skill') {
      newPlayer.skills.push(node.skillId);
      showToast(`スキル「${node.name}」を習得した！`);
    } else {
      showToast(`能力「${node.name}」を解放した！`);
      if (node.stat === 'maxHp') newPlayer.hp += node.val;
      if (node.stat === 'maxMp') newPlayer.mp += node.val;
    }
    setPlayer(newPlayer);
  };

  // ==========================================
  // レンダリング関数
  // ==========================================

  const renderTitle = () => (
    <div className="flex flex-col items-center justify-center h-full space-y-8 p-6 animate-fade-in relative overflow-hidden bg-gray-900">
      <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+CjxwYXRoIGQ9Ik0wIDBoNDB2NDBIMHoiIGZpbGw9IiMxMTE4MjciLz4KPGNpcmNsZSBjeT0iMjAiIGN4PSIyMCIgcj0iMSIgZmlsbD0icmdiYSgyNTUsIDI1NSwgMjU1LCAwLjEpIi8+Cjwvc3ZnPg==')] opacity-50"></div>
      
      <div className="text-center relative z-10">
        <MapPin size={56} className="mx-auto text-blue-400 mb-6 drop-shadow-[0_0_15px_rgba(96,165,250,0.5)]" />
        <h1 className="text-4xl font-extrabold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500 shadow-sm mb-2">
          TERRITORY<br/>EXPAND RPG
        </h1>
        <p className="mt-3 text-gray-400 text-sm tracking-widest">未知の領土を切り拓け</p>
      </div>
      
      <div className="w-full max-w-xs space-y-4 relative z-10 mt-10">
        <button onClick={() => setGameState('create')} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform active:scale-95 flex items-center justify-center gap-2">
          <Play size={20} /> はじめから
        </button>
        <button onClick={loadGame} className="w-full bg-gray-700 hover:bg-gray-600 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95 flex items-center justify-center gap-2">
          <Save size={20} /> つづきから
        </button>
      </div>
    </div>
  );

  const renderCreate = () => (
    <div className="flex flex-col h-full p-6 space-y-6">
      <h2 className="text-2xl font-bold text-center border-b border-gray-700 pb-2">キャラクター作成</h2>
      <div className="space-y-2">
        <label className="text-gray-400 text-sm">名前を入力</label>
        <input 
          type="text" maxLength={10} value={createData.name}
          onChange={(e) => setCreateData({...createData, name: e.target.value})}
          className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:outline-none focus:border-blue-500"
          placeholder="勇者の名前"
        />
      </div>
      <div className="space-y-2">
        <label className="text-gray-400 text-sm">アバターを選択</label>
        <div className="grid grid-cols-4 gap-3">
          {AVATARS.map(av => (
            <button key={av} onClick={() => setCreateData({...createData, avatar: av})}
              className={`text-3xl p-2 rounded-lg border-2 transition-all ${createData.avatar === av ? 'border-blue-500 bg-gray-700' : 'border-transparent bg-gray-800'}`}>
              {av}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-grow"></div>
      <button onClick={initGame} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl shadow-lg transition-transform active:scale-95">冒険を始める</button>
      <button onClick={() => setGameState('title')} className="w-full bg-transparent text-gray-400 py-2 text-sm">戻る</button>
    </div>
  );

  const renderCityscape = () => {
    const hour = new Date().getHours();
    let skyClass = "bg-sky-400"; 
    let sunMoon = <Sun className="text-yellow-300 absolute top-4 left-6 animate-pulse" size={32} />;
    
    if (hour >= 16 && hour < 19) {
      skyClass = "bg-orange-500"; 
      sunMoon = <Sun className="text-red-500 absolute top-10 left-10" size={32} />;
    } else if (hour >= 19 || hour < 6) {
      skyClass = "bg-indigo-950"; 
      sunMoon = <Moon className="text-yellow-100 absolute top-4 right-8" size={32} />;
    } else if (hour >= 6 && hour < 10) {
      skyClass = "bg-blue-300"; 
      sunMoon = <Sun className="text-yellow-200 absolute top-8 left-4" size={32} />;
    }

    const merchantHere = isMerchantAvailable();

    return (
      <div className={`h-36 w-full relative overflow-hidden transition-colors duration-1000 ${skyClass}`}>
        {sunMoon}
        <Cloud className="text-white/20 absolute top-6 right-16" size={48} />
        <Cloud className="text-white/20 absolute top-12 left-24" size={36} />
        
        {/* 建物のシルエット */}
        <div className="absolute bottom-0 w-full flex items-end justify-around px-2 pb-1 gap-1">
          <div className="w-1/4 h-16 bg-gray-900 rounded-t-sm relative">
            <div className="absolute top-2 left-2 w-3 h-4 bg-yellow-500/50"></div>
          </div>
          <div className="w-1/3 h-24 bg-gray-800 rounded-t-md relative">
            <div className="absolute top-4 left-3 w-4 h-5 bg-yellow-500/50"></div>
            <div className="absolute top-4 right-3 w-4 h-5 bg-yellow-500/50"></div>
          </div>
          <div className="w-1/4 h-20 bg-gray-900 rounded-t-sm relative">
             {/* 商人がいる場合はアイコンを表示 */}
             {merchantHere && (
               <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-green-400 p-1 rounded-full border border-green-700 animate-bounce">
                 <Store size={16} />
               </div>
             )}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-6 h-8 bg-yellow-500/30 rounded-t-full"></div>
          </div>
        </div>
        <div className="absolute bottom-0 w-full h-1 bg-gray-950"></div>
      </div>
    );
  };

  const renderMain = () => {
    const stats = getStats();
    return (
      <div className="flex flex-col h-full bg-gray-900">
        
        {/* 街の風景エリア */}
        {renderCityscape()}

        {/* ステータスヘッダー */}
        <div className="bg-gray-800 p-4 shadow-md rounded-b-2xl border-b border-gray-700 relative -mt-2 z-10">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-3">
              <div className="text-4xl bg-gray-700 p-2 rounded-full h-14 w-14 flex items-center justify-center border border-gray-600">{player.avatar}</div>
              <div>
                <div className="font-bold text-lg">{player.name} <span className="text-yellow-400 text-sm font-normal">Lv.{player.level}</span></div>
                <div className="text-sm text-gray-400 flex items-center gap-1"><MapPin size={14}/> 領土: {player.territory}</div>
              </div>
            </div>
            <div className="text-right">
              <div className="text-yellow-400 font-bold flex items-center justify-end gap-1"><Coins size={16}/> {player.gold} G</div>
              <div className="text-blue-300 text-sm font-bold">SP: {player.sp}</div>
            </div>
          </div>
          
          <div className="space-y-2">
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-green-400 font-bold">HP</span>
                <span>{player.hp} / {stats.maxHp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-green-500 h-2 rounded-full transition-all" style={{width: `${Math.max(0, (player.hp/stats.maxHp)*100)}%`}}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-blue-400 font-bold">MP</span>
                <span>{player.mp} / {stats.maxMp}</span>
              </div>
              <div className="w-full bg-gray-700 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full transition-all" style={{width: `${Math.max(0, stats.maxMp > 0 ? (player.mp/stats.maxMp)*100 : 0)}%`}}></div>
              </div>
            </div>
          </div>
        </div>

        {/* メインアクション */}
        <div className="flex-grow p-4 space-y-4 overflow-y-auto pb-20">
          <button onClick={startBattle} className="w-full bg-gradient-to-r from-red-600 to-orange-500 text-white font-bold py-5 rounded-2xl shadow-lg flex flex-col items-center justify-center gap-1 active:scale-95 transition-transform">
            <Sword size={28} />
            <span className="text-lg">領土を広げる (戦闘へ)</span>
          </button>

          <div className="grid grid-cols-2 gap-4">
            <button onClick={() => setGameState('inventory')} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-gray-700">
              <Backpack size={24} className="text-purple-400"/>
              <span className="text-sm font-bold">装備・道具</span>
            </button>
            <button onClick={() => setGameState('skill')} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-gray-700 relative">
              <Zap size={24} className="text-yellow-400"/>
              <span className="text-sm font-bold">スキル樹</span>
              {player.sp > 0 && <span className="absolute top-2 right-2 bg-red-500 w-3 h-3 rounded-full animate-pulse shadow-[0_0_10px_rgba(239,68,68,1)]"></span>}
            </button>
            <button onClick={handleShopClick} className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-gray-700 relative">
              <Store size={24} className="text-green-400"/>
              <span className="text-sm font-bold">商人</span>
              {isMerchantAvailable() && <span className="absolute top-2 right-2 text-green-400 text-xs font-bold">営業中</span>}
            </button>
            <button onClick={() => {
                if (player.gold >= 50) {
                  setPlayer({...player, gold: player.gold - 50, hp: stats.maxHp, mp: stats.maxMp});
                  showToast('50G支払い、宿屋で休んで全回復した！');
                } else {
                  showToast('ゴールドが足りない...');
                }
              }}
              className="bg-gray-800 border border-gray-700 p-4 rounded-xl flex flex-col items-center justify-center gap-2 active:bg-gray-700">
              <Heart size={24} className="text-pink-400"/>
              <span className="text-sm font-bold">宿屋 (50G)</span>
            </button>
          </div>
        </div>

        {/* フッターナビ */}
        <div className="bg-gray-900/90 backdrop-blur-sm p-2 flex justify-around border-t border-gray-800 absolute bottom-0 w-full max-w-md z-20">
          <button onClick={saveGame} className="flex flex-col items-center text-gray-400 hover:text-white p-2">
            <Save size={20} />
            <span className="text-xs mt-1">セーブ</span>
          </button>
          <button onClick={() => setGameState('title')} className="flex flex-col items-center text-gray-400 hover:text-white p-2">
            <User size={20} />
            <span className="text-xs mt-1">タイトルへ</span>
          </button>
        </div>
      </div>
    );
  };

  const renderBattle = () => {
    const { enemy, logs, isOver } = battle;
    const stats = getStats();
    
    return (
      <div className="flex flex-col h-full bg-gray-950">
        <div className="flex-1 flex flex-col items-center justify-center p-6 relative">
          <div className="text-center mb-6 animate-bounce">
            <Skull size={90} className="text-red-500 mx-auto drop-shadow-[0_0_20px_rgba(239,68,68,0.6)]" />
          </div>
          <div className="w-full max-w-xs bg-gray-800/90 p-3 rounded-lg border border-gray-700 shadow-xl">
            <div className="flex justify-between items-center mb-1">
              <span className="font-bold text-red-400">{enemy.name} <span className="text-xs font-normal">Lv.{enemy.level}</span></span>
            </div>
            <div className="w-full bg-gray-900 rounded-full h-2">
              <div className="bg-red-500 h-2 rounded-full transition-all" style={{width: `${Math.max(0, (enemy.hp/enemy.maxHp)*100)}%`}}></div>
            </div>
          </div>
        </div>

        <div className="h-44 bg-black border-y border-gray-800 p-3 overflow-y-auto text-sm space-y-1 font-mono leading-relaxed">
          {logs.map((log, idx) => {
            let color = 'text-gray-300';
            if (log.includes('倒した') || log.includes('手に入れた')) color = 'text-yellow-400';
            if (log.includes('ダメージを受けた')) color = 'text-red-400';
            if (log.includes('会心!')) color = 'text-orange-400 font-bold';
            if (log.includes('回復')) color = 'text-green-400';
            return <div key={idx} className={color}>{log}</div>;
          })}
          <div ref={logsEndRef} />
        </div>

        <div className="bg-gray-800 p-3 flex justify-between items-center text-sm border-b border-gray-700">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{player.avatar}</span>
            <span className="font-bold">{player.name}</span>
          </div>
          <div className="flex gap-4">
            <span className="text-green-400 font-bold">HP: {player.hp}/{stats.maxHp}</span>
            <span className="text-blue-400 font-bold">MP: {player.mp}/{stats.maxMp}</span>
          </div>
        </div>

        <div className="p-3 grid grid-cols-2 gap-2 bg-gray-900 pb-6">
          {!isOver && !selectedItem && (
            <>
              <button onClick={() => processTurn('attack')} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold border border-gray-600 active:bg-gray-500 shadow-md">たたかう</button>
              <button onClick={() => setSelectedItem('skill_select')} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold border border-gray-600 active:bg-gray-500 shadow-md">スキル</button>
              <button onClick={() => setSelectedItem('item_select')} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold border border-gray-600 active:bg-gray-500 shadow-md">アイテム</button>
              <button onClick={() => processTurn('flee')} className="bg-gray-700 hover:bg-gray-600 p-3 rounded-lg font-bold border border-gray-600 active:bg-gray-500 shadow-md">にげる</button>
            </>
          )}

          {!isOver && selectedItem === 'skill_select' && (
            <div className="col-span-2 bg-gray-800 p-2 rounded-lg border border-gray-700 space-y-2 max-h-48 overflow-y-auto shadow-inner">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm text-gray-400 font-bold">スキル選択</span>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 bg-gray-700 p-1 rounded hover:bg-gray-600"><X size={16}/></button>
              </div>
              {player.skills.length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-2">習得しているスキルがありません</div>
              ) : (
                player.skills.map(skillId => {
                  const s = SKILLS_DATA[skillId];
                  const canUse = player.mp >= s.mpCost;
                  return (
                    <button key={skillId} disabled={!canUse} onClick={() => {setSelectedItem(null); processTurn('skill', s);}} 
                      className={`w-full text-left p-2 rounded flex justify-between items-center ${canUse ? 'bg-gray-700 active:bg-gray-600 text-white' : 'bg-gray-800 text-gray-500'}`}>
                      <span>{s.name}</span>
                      <span className="text-blue-300 text-xs">MP {s.mpCost}</span>
                    </button>
                  );
                })
              )}
            </div>
          )}

          {!isOver && selectedItem === 'item_select' && (
            <div className="col-span-2 bg-gray-800 p-2 rounded-lg border border-gray-700 space-y-2 max-h-48 overflow-y-auto shadow-inner">
              <div className="flex justify-between items-center mb-2 px-1">
                <span className="text-sm text-gray-400 font-bold">アイテム選択</span>
                <button onClick={() => setSelectedItem(null)} className="text-gray-400 bg-gray-700 p-1 rounded hover:bg-gray-600"><X size={16}/></button>
              </div>
              {player.inventory.filter(i => i.type === 'item').length === 0 ? (
                <div className="text-center text-sm text-gray-500 py-2">使えるアイテムがありません</div>
              ) : (
                player.inventory.filter(i => i.type === 'item').map(item => (
                  <button key={item.uid} onClick={() => useItemInBattle(item)} className="w-full text-left bg-gray-700 p-2 rounded flex justify-between items-center active:bg-gray-600 text-white">
                    <span>{item.name} <span className="text-xs text-gray-400">x{item.amount}</span></span>
                    <span className="text-green-300 text-xs">回復</span>
                  </button>
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderInventory = () => {
    const stats = getStats();
    return (
      <div className="flex flex-col h-full bg-gray-900 relative">
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700 shadow-md z-10">
          <h2 className="text-xl font-bold flex items-center gap-2"><Backpack size={20}/> 装備・道具</h2>
          <button onClick={() => {setGameState('main'); setSelectedItem(null);}} className="bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold">戻る</button>
        </div>

        <div className="p-4 bg-gray-800 border-b border-gray-700">
          <div className="grid grid-cols-4 gap-2 text-sm mb-4 text-center">
            <div className="bg-gray-700 p-2 rounded"><div className="text-gray-400 text-xs">攻撃</div><div className="font-bold">{stats.atk}</div></div>
            <div className="bg-gray-700 p-2 rounded"><div className="text-gray-400 text-xs">防御</div><div className="font-bold">{stats.def}</div></div>
            <div className="bg-gray-700 p-2 rounded"><div className="text-gray-400 text-xs">速さ</div><div className="font-bold">{stats.agi}</div></div>
            <div className="bg-gray-700 p-2 rounded"><div className="text-gray-400 text-xs">運</div><div className="font-bold text-yellow-400">{stats.luk}</div></div>
          </div>
          <div className="space-y-2 text-sm">
            <div className="flex bg-gray-700/50 p-2 rounded items-center border border-gray-600">
              <span className="w-12 text-gray-400">武器:</span> 
              <span className="font-bold text-white">{player.equipment.weapon?.name || 'なし'}</span>
            </div>
            <div className="flex bg-gray-700/50 p-2 rounded items-center border border-gray-600">
              <span className="w-12 text-gray-400">防具:</span> 
              <span className="font-bold text-white">{player.equipment.armor?.name || 'なし'}</span>
            </div>
            <div className="flex bg-gray-700/50 p-2 rounded items-center border border-gray-600">
              <span className="w-12 text-gray-400">靴:</span> 
              <span className="font-bold text-white">{player.equipment.shoes?.name || 'なし'}</span>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2 pb-6">
          {player.inventory.map(item => {
            const isEquipped = Object.values(player.equipment).some(eq => eq?.uid === item.uid);
            const isSelected = selectedItem?.uid === item.uid;
            return (
              <div key={item.uid} 
                onClick={() => setSelectedItem(isSelected ? null : item)}
                className={`bg-gray-800 border p-3 rounded-lg transition-all ${isSelected ? 'border-blue-500 bg-gray-700 shadow-md' : 'border-gray-700'}`}
              >
                <div className="flex justify-between items-center">
                  <div className="font-bold flex items-center gap-2">
                    {item.type === 'weapon' && <Sword size={16} className="text-red-400"/>}
                    {item.type === 'armor' && <Shield size={16} className="text-blue-400"/>}
                    {item.type === 'shoes' && <Zap size={16} className="text-yellow-400"/>}
                    {item.type === 'item' && <Heart size={16} className="text-green-400"/>}
                    {item.name} {item.amount && <span className="text-gray-400 text-sm">x{item.amount}</span>}
                  </div>
                  {isEquipped && <span className="text-xs bg-blue-600/80 px-2 py-1 rounded text-white font-bold border border-blue-500">装備中</span>}
                </div>
                
                {isSelected && (
                  <div className="mt-3 pt-3 border-t border-gray-600 animate-fade-in">
                    <p className="text-sm text-gray-300 mb-3">{item.desc}</p>
                    
                    {item.type === 'item' ? (
                      <button onClick={(e) => { e.stopPropagation(); useItemField(item); }} className="w-full bg-green-600 hover:bg-green-500 p-3 rounded-lg font-bold text-sm shadow">使う</button>
                    ) : (
                      <button 
                        onClick={(e) => { e.stopPropagation(); equipItem(item); }} 
                        disabled={isEquipped}
                        className="w-full bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 p-3 rounded-lg font-bold text-sm shadow"
                      >
                        {isEquipped ? '装備済み' : '装備する'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            )
          })}
          {player.inventory.length === 0 && <div className="text-center text-gray-500 mt-10">所持品はありません</div>}
        </div>
      </div>
    );
  };

  const renderSkillTree = () => {
    return (
      <div className="flex flex-col h-full bg-gray-900 relative">
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700 shadow-md z-10">
          <h2 className="text-xl font-bold flex items-center gap-2"><Zap size={20} className="text-yellow-400"/> スキル樹</h2>
          <button onClick={() => setGameState('main')} className="bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold">戻る</button>
        </div>
        
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <span className="text-gray-300 font-bold">残りSP</span>
          <span className="text-2xl font-bold text-blue-400 drop-shadow-[0_0_5px_rgba(96,165,250,0.5)]">{player.sp}</span>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-10">
          {SKILL_TREE.map(node => {
            const isUnlocked = player.unlockedNodes.includes(node.id);
            const canUnlock = !isUnlocked && node.req.every(reqId => player.unlockedNodes.includes(reqId));
            
            let bgClass = 'bg-gray-800 border-gray-700 opacity-50';
            if (isUnlocked) bgClass = 'bg-gray-800 border-green-600/50 opacity-70';
            else if (canUnlock) bgClass = 'bg-gray-700 border-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.3)]';

            return (
              <div key={node.id} className={`p-4 rounded-xl border-2 transition-all ${bgClass}`}>
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-bold flex items-center gap-2 text-white">
                      {isUnlocked && <span className="text-green-400 text-xs border border-green-600 px-1 rounded bg-green-900/30">習得済</span>}
                      {node.name}
                    </h3>
                    <p className="text-sm text-gray-300 mt-1">{node.desc}</p>
                  </div>
                  {!isUnlocked && <div className="text-blue-300 font-bold bg-blue-900/40 px-2 py-1 rounded text-sm border border-blue-800">{node.cost} SP</div>}
                </div>
                
                {canUnlock && (
                  <button onClick={() => unlockSkill(node)} className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white p-2 rounded-lg font-bold text-sm shadow">
                    解放する
                  </button>
                )}
                {!canUnlock && !isUnlocked && node.req.length > 0 && (
                  <p className="text-xs text-red-400 mt-2 font-bold">前提条件が未達成</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderShop = () => {
    return (
      <div className="flex flex-col h-full bg-gray-900 relative">
        <div className="bg-gray-800 p-4 flex items-center justify-between border-b border-gray-700 shadow-md z-10">
          <h2 className="text-xl font-bold flex items-center gap-2"><Store size={20} className="text-green-400"/> 商人</h2>
          <button onClick={() => setGameState('main')} className="bg-gray-700 px-4 py-2 rounded-lg text-sm font-bold">戻る</button>
        </div>
        
        <div className="p-4 bg-gray-800 border-b border-gray-700 flex justify-between items-center sticky top-0 z-10 shadow-sm">
          <span className="text-gray-300 font-bold">所持金</span>
          <span className="text-xl font-bold text-yellow-400 drop-shadow-[0_0_5px_rgba(250,204,21,0.5)]"><Coins size={16} className="inline mr-1"/>{player.gold} G</span>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-3 pb-8">
          {SHOP_ITEMS.map(item => (
            <div key={item.id} className="bg-gray-800 border border-gray-700 p-3 rounded-lg flex justify-between items-center shadow">
              <div>
                <div className="font-bold flex items-center gap-1 text-white">
                  {item.type === 'weapon' && <Sword size={14} className="text-red-400"/>}
                  {item.type === 'armor' && <Shield size={14} className="text-blue-400"/>}
                  {item.type === 'shoes' && <Zap size={14} className="text-yellow-400"/>}
                  {item.type === 'item' && <Heart size={14} className="text-green-400"/>}
                  {item.name}
                </div>
                <div className="text-xs text-gray-400 mt-1">{item.desc}</div>
              </div>
              <div className="flex flex-col items-end gap-2">
                <span className="text-yellow-400 font-bold text-sm">{item.price} G</span>
                <button 
                  onClick={() => buyItem(item)}
                  disabled={player.gold < item.price}
                  className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold shadow"
                >
                  購入
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex justify-center selection:bg-blue-500/30">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.3s ease-in-out; }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #111827; }
        ::-webkit-scrollbar-thumb { background: #4b5563; border-radius: 4px; }
      `}} />

      <div className="w-full max-w-md bg-gray-900 shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden flex flex-col h-screen relative">
        
        {toastMsg && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-gray-800 border border-gray-600 text-white px-4 py-3 rounded-lg shadow-2xl z-50 text-sm w-11/12 text-center animate-fade-in font-bold flex items-center justify-center gap-2">
            <Activity size={16} className="text-blue-400"/> {toastMsg}
          </div>
        )}

        {gameState === 'title' && renderTitle()}
        {gameState === 'create' && renderCreate()}
        {gameState === 'main' && renderMain()}
        {gameState === 'battle' && renderBattle()}
        {gameState === 'shop' && renderShop()}
        {gameState === 'skill' && renderSkillTree()}
        {gameState === 'inventory' && renderInventory()}

      </div>
    </div>
  );
}
