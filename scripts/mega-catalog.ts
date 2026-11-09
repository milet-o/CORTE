import { TargetTopic, TARGET_MASS_TOPICS } from './mass-topics-catalog';
import { EXPANDED_TOPICS_1000 } from './expanded-topics-1000';
import { EXPANDED_TOPICS_PART2 } from './expanded-topics-part2';
import { EXPANDED_TOPICS_PART3 } from './expanded-topics-part3';
import { EXPANDED_TOPICS_PART4 } from './expanded-topics-part4';
import { EXPANDED_TOPICS_PART5 } from './expanded-topics-part5';
import { EXPANDED_TOPICS_PART6 } from './expanded-topics-part6';
import { EXPANDED_TOPICS_PART7 } from './expanded-topics-part7';
import { EXPANDED_TOPICS_PART8 } from './expanded-topics-part8';

// Catálogo consolidado completo para atingir mais de 1000 questões
export const ALL_MEGA_TOPICS: TargetTopic[] = [
  ...TARGET_MASS_TOPICS,
  ...EXPANDED_TOPICS_1000,
  ...EXPANDED_TOPICS_PART2,
  ...EXPANDED_TOPICS_PART3,
  ...EXPANDED_TOPICS_PART4,
  ...EXPANDED_TOPICS_PART5,
  ...EXPANDED_TOPICS_PART6,
  ...EXPANDED_TOPICS_PART7,
  ...EXPANDED_TOPICS_PART8
];
