import { initCabinet } from './cabinet';
import { initControls } from './controls';
import { initDemos } from './demos';
import { initDesk } from './desk';
import { initPapers } from './papers';
import { initPipeline } from './pipeline';
import { initPreviews } from './preview';

initControls();
initDesk();
initDemos();
initPapers();
initPipeline();
initPreviews();
void initCabinet();
