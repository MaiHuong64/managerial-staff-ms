import { getBGHPendingApprovals, getBGHStatistics, getPTCCTSystemStats, getPTCCTRecentActivities } from "./dashboard.repository";
import { mapArrayToCamel, mapToCamel } from "../../utils/mapper";

export const getBGHDashboardData = async () => {
    const [pendingApprovals, statistics] = await Promise.all([
        getBGHPendingApprovals(),
        getBGHStatistics()
    ]);

    return {
        pendingApprovals: mapArrayToCamel(pendingApprovals),
        statistics: mapToCamel(statistics)
    };
};

export const getPTCCTDashboardData = async () => {
    const [systemStats, recentActivities] = await Promise.all([
        getPTCCTSystemStats(),
        getPTCCTRecentActivities()
    ]);

    return {
        systemStats: mapToCamel(systemStats),
        recentActivities: mapArrayToCamel(recentActivities)
    };
};
