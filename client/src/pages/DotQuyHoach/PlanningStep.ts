import type { ChiTietQuyHoach } from "../../types/QuyHoach";

export type loaiQuyHoach = 1 | 2
type Step =  {
  label: string;
  shortLabel: string;
  color: string;
  description?: string;
}
const FLOW_QT169: Record<number, Step> = {
  0: {label: "Không đạt", shortLabel:"Không đạt", color:"red"},
  2: {label: "Hội nghị lãnh đạo lần 1", shortLabel:"HN lãnh đạo lần 1", color:"Thảo luận"},
  3: {label: "Hội nghị cán bộ chủ chốt", shortLabel:"HN CB chủ chốt", color:"purple", description:"Lấy phiếu"},
  4: {label: "Hội nghị lãnh đạo mở rộng", shortLabel:"HN lãnh đạo MR", color:"orange", description: "Lấy phiếu"},
  5: {label: "Hội nghị lãnh đạo lần 2", shortLabel:"HN lãnh đạo lần 2", color:"gold", description: "Biểu quyết"},
  6: {label: "Hoàn thành", shortLabel:"Hoàn thành", color:"green", description: "Chốt danh sách"},
}
const FLOW_QT170: Record<number, Step> = {
  0: {label: "Ra khỏi quy hoạch", shortLabel:"Ra khỏi QH", color:"red"},
  1: {label: "Rà soát, đưa ra khỏi quy hoạch", shortLabel:"Rà soát đưa ra", color:"volcano", description: "Biểu quyết"},
  2: {label: "Hội nghị cán bộ chủ chốt", shortLabel:"HN CB chủ chốt", color:"purple", description:"Lấy phiếu"},
  3: {label: "Hội nghị lãnh đạo mở rộng", shortLabel:"HN lãnh đạo MR", color:"orange", description: "Lấy phiếu"},
  4: {label: "Hội nghị lãnh đạo lần 2", shortLabel:"HN lãnh đạo lần 2", color:"gold", description: "Biểu quyết"},
  6: {label: "Hoàn thành", shortLabel:"Hoàn thành", color:"green", description: "Chốt danh sách"},
}
export const getFlowQH = (loaiQuyHoach: loaiQuyHoach) =>
  loaiQuyHoach === 1 ? FLOW_QT169 : FLOW_QT170;

export const displayPlanningStep = (loaiQuyHoach: loaiQuyHoach, step: number): Step => {
  const flow = getFlowQH(loaiQuyHoach);
  // return flow[step] !== null && flow[step] !== undefined ? flow[step] : { label: "N/A", shortLabel: "N/A", color: "default" };
  return flow[step] ?? { label: "N/A", shortLabel: "N/A", color: "default" };
} 

export const getCurrentStep = (loaiQuyHoach: loaiQuyHoach) => {
  const flow = getFlowQH(loaiQuyHoach);
  const currentStep = loaiQuyHoach === 1 ? [2, 3, 4, 5] : [1, 2, 3, 4];
  return currentStep.map((step) => ({
    title: flow[step].shortLabel,
    description: flow[step].description
  }))
}
// Step (Andt bắt đầu từ 0)
export const getCurrentIndex = (loaiQuyHoach: loaiQuyHoach, step: number) => {
  return loaiQuyHoach === 1 ? step - 2 : step - 1
}

// Lấy bước vote theo đợt
export const getVoteStep = (loaiQuyHoach: loaiQuyHoach) =>{
  return loaiQuyHoach === 1 ? [2, 3, 4, 5] : [1, 2, 3, 4];
}

// Kiểm tra trang thái vote
export const isVote = (loaiQuyHoach: loaiQuyHoach, step: number) => {
  if(step === null) return false;
  return getVoteStep(loaiQuyHoach).includes(step);
}

// Tìm bước hiện tại
export const findCurrentStep = (staffList: ChiTietQuyHoach[], loaiQuyHoach: loaiQuyHoach) => {
  const voteStep = getVoteStep(loaiQuyHoach);
  const activeCandidates = staffList.filter((staff) => voteStep.includes(staff.buocHienTai));
  if (activeCandidates.length === 0) return null;
  return Math.min(...activeCandidates.map(s => s.buocHienTai));
}