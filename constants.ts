import { 
  Zap, 
  Brain, 
  Puzzle, 
  Grid3x3, 
  Eye, 
  Target, 
  Lightbulb,
  Palette,
  Waves,
  Images,
  Ear,
  SplitSquareHorizontal,
  Tags
} from 'lucide-react';
import { GameDefinition } from './types';

export const GAMES: GameDefinition[] = [
  {
    id: 'schulte_grid',
    title: '舒尔特方格 (Schulte Grid)',
    description: '专注力训练。以最快速度按顺序点击 1-25 的数字。',
    icon: Grid3x3,
    color: 'text-blue-400',
    promptTopic: 'focus', 
    type: 'schulte',
    scoringType: 'time'
  },
  {
    id: 'stroop_challenge',
    title: '颜色干扰 (Stroop)',
    description: '认知抑制能力。选择字体的颜色，忽略文字本身的含义。',
    icon: Palette,
    color: 'text-red-400',
    promptTopic: 'inhibition',
    type: 'stroop',
    scoringType: 'score'
  },
  {
    id: 'echo_stream',
    title: '记忆流 (Echo Stream)',
    description: '顺序记忆。记住出现的物品序列，然后从混淆项中找出它们。',
    icon: Waves,
    color: 'text-purple-400',
    promptTopic: 'memory',
    type: 'memory',
    memoryConfig: { mode: 'sequential' },
    scoringType: 'score'
  },
  {
    id: 'sonic_cipher',
    title: '听觉密码 (Sonic Cipher)',
    description: '听觉注意力。在白噪音干扰中辨别并输入听到的数字序列。',
    icon: Ear,
    color: 'text-pink-400',
    promptTopic: 'auditory_attention',
    type: 'audio',
    scoringType: 'score'
  },
  {
    id: 'quantum_sync',
    title: '量子同步 (Quantum Sync)',
    description: '双侧协调。使用双指同时引导两个能量核心移动。',
    icon: SplitSquareHorizontal,
    color: 'text-teal-400',
    promptTopic: 'coordination',
    type: 'mirror',
    scoringType: 'score'
  },
  {
    id: 'category_nexus',
    title: '极速分类 (Categorization)',
    description: '快速分类。在不断变化的规则下对数据流进行归类。',
    icon: Tags,
    color: 'text-orange-400',
    promptTopic: 'categorization',
    type: 'categorization',
    scoringType: 'score'
  },
  {
    id: 'hologram_recall',
    title: '全息记忆 (Recall)',
    description: '瞬间记忆。一次性记住整个场景，然后找出缺失的部分。',
    icon: Images,
    color: 'text-green-400',
    promptTopic: 'photographic memory',
    type: 'memory',
    memoryConfig: { mode: 'simultaneous' },
    scoringType: 'score'
  },
  {
    id: 'knowledge_king',
    title: '知识核心 (Trivia)',
    description: '跨星系通用知识库问答。',
    icon: Lightbulb,
    color: 'text-cyan-400',
    promptTopic: 'generate a general knowledge trivia question regarding science, history, or technology',
    scoringType: 'score'
  },
];

export const APP_NAME = "BrainBoost";