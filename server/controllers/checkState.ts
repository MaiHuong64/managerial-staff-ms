import pool from "../config/db"

export interface VoteResult {
  so_nguoi_trieu_tap: number;
  so_nguoi_co_mat: number;
  so_phieu_dong_y: number;
  so_phieu_thu_ve: number;
}

enum TrangThai {
  SELECTING = 1,
  VOTING = 2,
  PROPOSAL = 3,
  APPROVED = 4,
  DOSSIER = 5,
  COMPLETED = 6,
  FAILED = 7
}

// Duyệt xong phiếu chủ trương
export const canMoveToVoting = async (dot_bo_nhiem_id: number): Promise<boolean> => {
    const result = await pool.query(`SELECT ptc.trang_thai
                                FROM phieu_chu_truong pct LEFT JOIN dot_bo_nhiem dbn ON pct.id = dbn.phieu_chu_truong_id
                                WHERE  dbn.id = $1`, [dot_bo_nhiem_id])

    if (result.rowCount === 0) return false;
    return result.rows[0].trang_thai === 2; // Neu trang thai xong se tien hanh vote
}

// Có ứng viên trong đợt bổ nhiệm
export const  hasCandidates = async (dot_bo_nhiem_id: number): Promise<boolean> => {
    const result = await pool.query(`select count(*) from chi_tiet_bo_nhiem where trang_thai = 1 and dot_bo_nhiem_id = $1`, [dot_bo_nhiem_id])
    return parseInt(result.rows[0].count) > 0;
}
// Kiểm tra tất cả ứng viên có kết quả bỏ  phiếu chưa
export const allCandidatesHaveVotes = async (dot_bo_nhiem_id: number, buoc_hien_tai: number): Promise<boolean> => {
    const result = await pool.query(`SELECT COUNT(*)
                                    FROM chi_tiet_bo_nhiem ctbn
                                    LEFT JOIN ket_qua_bo_phieu kq 
                                        ON kq.chi_tiet_bo_nhiem_id = ctbn.id
                                        AND kq.buoc_hoi_nghi = $2
                                    WHERE 
                                        ctbn.dot_bo_nhiem_id = $1
                                        AND ctbn.trang_thai = 1
                                        AND kq.id IS NULL)`, [dot_bo_nhiem_id, buoc_hien_tai])
    return parseInt(result.rows[0].count) === 0;
}
export const hasPassedCandidate = async (dotId: number, buoc: number): Promise<boolean> => {
  const result = await pool.query()
}
// Lập phương án nhân sự
export const canMoveToProposal = async (dot_bo_nhiem_id: number): Promise<{ok: boolean, reason: string}> => {
    if(! (await canMoveToVoting(dot_bo_nhiem_id)))
        return {ok: false, reason: "Phiếu chủ trương chưa được phê duyệt"}
    if(! (await hasCandidates(dot_bo_nhiem_id)))
        return {ok: false, reason: "Chưa có ứng viên trong đợt bổ nhiệm"}
    for(const buoc of [2,3,4,5]){
        if(! (await allCandidatesHaveVotes(dot_bo_nhiem_id, buoc)))
            return {ok: false, reason: "Còn ứng viên chưa có kết quả bỏ phiếu"}
    }
}
// Phê duyệt
export const canMoveToApproval  = async (dot_bo_nhiem_id: number): Promise<{ok: boolean, reason?: string}> => {
    const proposal =  await canMoveToApproval(dot_bo_nhiem_id);
    if(!proposal.ok)
        return proposal
    const result = await pool.query(`SELECT id
                                    FROM phuong_an_nhan_su
                                    WHERE dot_bo_nhiem_id = $1 AND trang_thai = 1`, [dot_bo_nhiem_id])
    if(result.rowCount === 0)
        return {ok: false, reason: "Chua có phương án nhân sự được lập ra"};
    return {ok: true}
}

// Quyết định phê duyệt
export const canCreateDecision  = async (dot_bo_nhiem_id: number): Promise<boolean> => {

}
export const moveToNextStep = async (dotId: number, buoc: number) => {
  const result = await pool.query(
    'SELECT trang_thai FROM dot_bo_nhiem WHERE id = $1',
    [dotId]
  );

  if (result.rowCount === 0) {
    throw new Error("Không tồn tại đợt bổ nhiệm");
  }

  const curr = result.rows[0].trang_thai;
  let next: number;

  switch (curr) {
    case TrangThai.SELECTING:
      if (!(await hasCandidates(dotId))) {
        throw new Error("Chưa có ứng viên");
      }
      next = TrangThai.VOTING;
      break;

    case TrangThai.VOTING:
      if (!(await allCandidatesHaveVotes(dotId, buoc))) {
        throw new Error("Chưa bỏ phiếu xong");
      }

      if (!(await hasPassedCandidate(dotId, buoc))) {
        next = TrangThai.FAILED;
        break;
      }

      next = TrangThai.PROPOSAL;
      break;

    case TrangThai.PROPOSAL:
      const check = await canMoveToApproval(dotId);
      if (!check.ok) {
        throw new Error(check.reason);
      }
      next = TrangThai.APPROVED;
      break;

    case TrangThai.APPROVED:
      next = TrangThai.DOSSIER;
      break;

    case TrangThai.DOSSIER:
      next = TrangThai.COMPLETED;
      break;

    default:
      throw new Error("Không thể chuyển trạng thái");
  }

  await pool.query(
    `UPDATE dot_bo_nhiem SET trang_thai = $1 WHERE id = $2`,
    [next, dotId]
  );
};

// export const moveToNextStep