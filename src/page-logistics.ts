// Logistics hub bootstrap — static markup + notes widget + the folded-in
// pre-trip checklist (folded from pre-trip.html during the 2026-06-08
// structure simplification; the checklist init no-ops if its markup is absent).
import { initNotesWidget } from './notes-widget.js';
import { initChatPlanPopup } from './popup-chat-plan.js';
import { initPretripChecklist } from './page-pre-trip.js';

initNotesWidget();
initChatPlanPopup();
initPretripChecklist();
