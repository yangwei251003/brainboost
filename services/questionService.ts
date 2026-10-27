import type { QuestionData } from '../types';

// Curated deterministic examples. This public build does not call an AI model.
const SAMPLE_QUESTIONS: QuestionData[] = [
  {
    "question": "一个字节通常包含多少位？",
    "options": [
      "4",
      "8",
      "16",
      "32"
    ],
    "correctAnswer": "8",
    "explanation": "现代通用计算机中，一个字节通常是8位。"
  },
  {
    "question": "二进制10对应十进制的多少？",
    "options": [
      "1",
      "2",
      "10",
      "20"
    ],
    "correctAnswer": "2",
    "explanation": "二进制的10等于1×2+0，即十进制2。"
  },
  {
    "question": "有序数组的二分查找，每次会如何缩小范围？",
    "options": [
      "减少一个元素",
      "大约减半",
      "增加一倍",
      "保持不变"
    ],
    "correctAnswer": "大约减半",
    "explanation": "比较中间元素后，可以排除不包含目标的一半范围。"
  },
  {
    "question": "在平面欧氏几何中，三角形内角和是多少？",
    "options": [
      "90°",
      "180°",
      "270°",
      "360°"
    ],
    "correctAnswer": "180°",
    "explanation": "平面欧氏几何中的三角形三个内角和为180°。"
  },
  {
    "question": "圆的周长与直径之比称为什么？",
    "options": [
      "自然常数e",
      "圆周率π",
      "黄金比例",
      "重力常数"
    ],
    "correctAnswer": "圆周率π",
    "explanation": "圆周率定义为圆的周长与其直径之比。"
  },
  {
    "question": "以下哪一个数是质数？",
    "options": [
      "9",
      "15",
      "17",
      "21"
    ],
    "correctAnswer": "17",
    "explanation": "17只有1和17两个正因数。"
  },
  {
    "question": "一个正方形边长加倍，面积会变成原来的多少倍？",
    "options": [
      "1倍",
      "2倍",
      "4倍",
      "8倍"
    ],
    "correctAnswer": "4倍",
    "explanation": "面积等于边长的平方，边长乘2使面积乘4。"
  },
  {
    "question": "栈结构通常遵循什么顺序？",
    "options": [
      "先进先出",
      "后进先出",
      "随机出入",
      "按大小排序"
    ],
    "correctAnswer": "后进先出",
    "explanation": "栈从同一端压入和弹出元素，因此最后放入的元素最先弹出。"
  },
  {
    "question": "队列结构通常遵循什么顺序？",
    "options": [
      "先进先出",
      "后进先出",
      "随机出入",
      "按字母排序"
    ],
    "correctAnswer": "先进先出",
    "explanation": "队列从尾端入队、从前端出队。"
  },
  {
    "question": "十进制25加75等于多少？",
    "options": [
      "90",
      "100",
      "110",
      "125"
    ],
    "correctAnswer": "100",
    "explanation": "25+75=100。"
  },
  {
    "question": "在标准大气压下，纯水的常见沸点约为多少？",
    "options": [
      "0°C",
      "50°C",
      "100°C",
      "150°C"
    ],
    "correctAnswer": "100°C",
    "explanation": "纯水在一个标准大气压下的沸点约为100°C，压力变化会影响沸点。"
  },
  {
    "question": "以下哪种数据结构可表达节点之间的任意连接？",
    "options": [
      "字符",
      "图",
      "单个布尔值",
      "单个整数"
    ],
    "correctAnswer": "图",
    "explanation": "图使用节点与边表示对象及其关系。"
  },
  {
    "question": "长度为8的数组，使用从0开始的下标时，最后一个下标是多少？",
    "options": [
      "6",
      "7",
      "8",
      "9"
    ],
    "correctAnswer": "7",
    "explanation": "从0开始的8个下标是0到7。"
  },
  {
    "question": "逻辑表达式“真 且 假”的结果是什么？",
    "options": [
      "真",
      "假",
      "既真又假",
      "未定义"
    ],
    "correctAnswer": "假",
    "explanation": "逻辑与只有在两边都为真时才为真。"
  },
  {
    "question": "1000毫秒等于多少秒？",
    "options": [
      "0.1秒",
      "1秒",
      "10秒",
      "100秒"
    ],
    "correctAnswer": "1秒",
    "explanation": "1秒等于1000毫秒。"
  }
];

export async function generateGameQuestions(_topic: string, difficulty: 'beginner' | 'intermediate' | 'expert' = 'intermediate', count = 5): Promise<QuestionData[]> {
  const start = difficulty === 'beginner' ? 0 : difficulty === 'expert' ? 10 : 5;
  return Array.from({ length: Math.max(1, Math.min(15, count)) }, (_, i) => { const q = SAMPLE_QUESTIONS[(start + i) % SAMPLE_QUESTIONS.length]!; return { ...q, options: [...q.options] }; });
}
