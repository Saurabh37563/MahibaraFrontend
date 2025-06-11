import fgaSdk from './fga-client.js';
import { 
  OpenFGATuple, 
  ReadRequest, 
  ReadResponse, 
  TupleKey,
  mapOpenFGATupleToTupleKey 
} from '../types/fga.types';

export class fgaUtils {
  // User Relations
  static async makeSystemAdmin(userId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'system_admin', `user:${userId}`);
  }

  static async removeSystemAdmin(userId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'system_admin', `user:${userId}`);
  }

  static async isSystemAdmin(userId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'system_admin', `user:${userId}`);
  }

  static async grantCreateOrganization(userId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'can_create_organization', `user:${userId}`);
  }

  static async revokeCreateOrganization(userId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'can_create_organization', `user:${userId}`);
  }

  static async canCreateOrganization(userId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'can_create_organization', `user:${userId}`);
  }

  // Organization Relations
  static async addOrganizationAdmin(userId: string, organizationId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'admin', `organization:${organizationId}`);
  }

  static async removeOrganizationAdmin(userId: string, organizationId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'admin', `organization:${organizationId}`);
  }

  static async isOrganizationAdmin(userId: string, organizationId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'admin', `organization:${organizationId}`);
  }

  static async addOrganizationMember(userId: string, organizationId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'member', `organization:${organizationId}`);
  }

  static async removeOrganizationMember(userId: string, organizationId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'member', `organization:${organizationId}`);
  }

  static async isOrganizationMember(userId: string, organizationId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'member', `organization:${organizationId}`);
  }

  // Team Relations
  static async setTeamParent(organizationId: string, teamId: string): Promise<void> {
    await fgaSdk.addRelationship(`organization:${organizationId}`, 'parent', `team:${teamId}`);
  }

  static async removeTeamParent(organizationId: string, teamId: string): Promise<void> {
    await fgaSdk.removeRelationship(`organization:${organizationId}`, 'parent', `team:${teamId}`);
  }

  static async addTeamAdmin(userId: string, teamId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'admin', `team:${teamId}`);
  }

  static async removeTeamAdmin(userId: string, teamId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'admin', `team:${teamId}`);
  }

  static async isTeamAdmin(userId: string, teamId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'admin', `team:${teamId}`);
  }

  static async addTeamMember(userId: string, teamId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'member', `team:${teamId}`);
  }

  static async removeTeamMember(userId: string, teamId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'member', `team:${teamId}`);
  }

  static async isTeamMember(userId: string, teamId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'member', `team:${teamId}`);
  }

  // Project Relations
  static async setProjectParent(teamId: string, projectId: string): Promise<void> {
    await fgaSdk.addRelationship(`team:${teamId}`, 'parent', `project:${projectId}`);
  }

  static async removeProjectParent(teamId: string, projectId: string): Promise<void> {
    await fgaSdk.removeRelationship(`team:${teamId}`, 'parent', `project:${projectId}`);
  }

  static async addProjectAdmin(userId: string, projectId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'admin', `project:${projectId}`);
  }

  static async removeProjectAdmin(userId: string, projectId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'admin', `project:${projectId}`);
  }

  static async isProjectAdmin(userId: string, projectId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'admin', `project:${projectId}`);
  }

  static async addProjectEditor(userId: string, projectId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'editor', `project:${projectId}`);
  }

  static async removeProjectEditor(userId: string, projectId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'editor', `project:${projectId}`);
  }

  static async isProjectEditor(userId: string, projectId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'editor', `project:${projectId}`);
  }

  static async addProjectViewer(userId: string, projectId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'viewer', `project:${projectId}`);
  }

  static async removeProjectViewer(userId: string, projectId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'viewer', `project:${projectId}`);
  }

  static async isProjectViewer(userId: string, projectId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'viewer', `project:${projectId}`);
  }

  // Excel File Relations
  static async setExcelFileParent(projectId: string, excelFileId: string): Promise<void> {
    await fgaSdk.addRelationship(`project:${projectId}`, 'parent', `excel_file:${excelFileId}`);
  }

  static async removeExcelFileParent(projectId: string, excelFileId: string): Promise<void> {
    await fgaSdk.removeRelationship(`project:${projectId}`, 'parent', `excel_file:${excelFileId}`);
  }

  static async setExcelFileOwner(userId: string, excelFileId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'owner', `excel_file:${excelFileId}`);
  }

  static async removeExcelFileOwner(userId: string, excelFileId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'owner', `excel_file:${excelFileId}`);
  }

  static async isExcelFileOwner(userId: string, excelFileId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'owner', `excel_file:${excelFileId}`);
  }

  static async addExcelFileEditor(userId: string, excelFileId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'editor', `excel_file:${excelFileId}`);
  }

  static async removeExcelFileEditor(userId: string, excelFileId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'editor', `excel_file:${excelFileId}`);
  }

  static async isExcelFileEditor(userId: string, excelFileId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'editor', `excel_file:${excelFileId}`);
  }

  static async addExcelFileViewer(userId: string, excelFileId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'viewer', `excel_file:${excelFileId}`);
  }

  static async removeExcelFileViewer(userId: string, excelFileId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'viewer', `excel_file:${excelFileId}`);
  }

  static async isExcelFileViewer(userId: string, excelFileId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'viewer', `excel_file:${excelFileId}`);
  }

  // Analysis Relations
  static async setAnalysisParent(projectId: string, analysisId: string): Promise<void> {
    await fgaSdk.addRelationship(`project:${projectId}`, 'parent', `analysis:${analysisId}`);
  }

  static async removeAnalysisParent(projectId: string, analysisId: string): Promise<void> {
    await fgaSdk.removeRelationship(`project:${projectId}`, 'parent', `analysis:${analysisId}`);
  }

  static async setAnalysisCreator(userId: string, analysisId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'creator', `analysis:${analysisId}`);
  }

  static async removeAnalysisCreator(userId: string, analysisId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'creator', `analysis:${analysisId}`);
  }

  static async isAnalysisCreator(userId: string, analysisId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'creator', `analysis:${analysisId}`);
  }

  static async addAnalysisExecutor(userId: string, analysisId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'executor', `analysis:${analysisId}`);
  }

  static async removeAnalysisExecutor(userId: string, analysisId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'executor', `analysis:${analysisId}`);
  }

  static async isAnalysisExecutor(userId: string, analysisId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'executor', `analysis:${analysisId}`);
  }

  static async addAnalysisViewer(userId: string, analysisId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'viewer', `analysis:${analysisId}`);
  }

  static async removeAnalysisViewer(userId: string, analysisId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'viewer', `analysis:${analysisId}`);
  }

  static async isAnalysisViewer(userId: string, analysisId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'viewer', `analysis:${analysisId}`);
  }

  // Result Relations
  static async setResultParent(analysisId: string, resultId: string): Promise<void> {
    await fgaSdk.addRelationship(`analysis:${analysisId}`, 'parent', `result:${resultId}`);
  }

  static async removeResultParent(analysisId: string, resultId: string): Promise<void> {
    await fgaSdk.removeRelationship(`analysis:${analysisId}`, 'parent', `result:${resultId}`);
  }

  static async addResultViewer(userId: string, resultId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'viewer', `result:${resultId}`);
  }

  static async removeResultViewer(userId: string, resultId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'viewer', `result:${resultId}`);
  }

  static async isResultViewer(userId: string, resultId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'viewer', `result:${resultId}`);
  }

  // Data Chat Relations
  static async setDataChatParent(excelFileId: string, dataChatId: string): Promise<void> {
    await fgaSdk.addRelationship(`excel_file:${excelFileId}`, 'parent', `data_chat:${dataChatId}`);
  }

  static async removeDataChatParent(excelFileId: string, dataChatId: string): Promise<void> {
    await fgaSdk.removeRelationship(`excel_file:${excelFileId}`, 'parent', `data_chat:${dataChatId}`);
  }

  static async addDataChatQuerier(userId: string, dataChatId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'querier', `data_chat:${dataChatId}`);
  }

  static async removeDataChatQuerier(userId: string, dataChatId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'querier', `data_chat:${dataChatId}`);
  }

  static async isDataChatQuerier(userId: string, dataChatId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'querier', `data_chat:${dataChatId}`);
  }

  static async addDataChatHistoryViewer(userId: string, dataChatId: string): Promise<void> {
    await fgaSdk.addRelationship(`user:${userId}`, 'chat_history_viewer', `data_chat:${dataChatId}`);
  }

  static async removeDataChatHistoryViewer(userId: string, dataChatId: string): Promise<void> {
    await fgaSdk.removeRelationship(`user:${userId}`, 'chat_history_viewer', `data_chat:${dataChatId}`);
  }

  static async isDataChatHistoryViewer(userId: string, dataChatId: string): Promise<boolean> {
    return await fgaSdk.checkRelationship(`user:${userId}`, 'chat_history_viewer', `data_chat:${dataChatId}`);
  }

  // Batch Operations
  static async writeMultipleRelationships(relationships: BatchRelationship[]): Promise<void> {
    const tupleKeys = relationships.map(rel => ({
      user: rel.user,
      relation: rel.relation,
      object: rel.object
    }));

    const request: WriteRequest = {
      writes: { tuple_keys: tupleKeys }
    };

    await fgaSdk.write(request);
  }

  static async removeMultipleRelationships(relationships: BatchRelationship[]): Promise<void> {
    const tupleKeys = relationships.map(rel => ({
      user: rel.user,
      relation: rel.relation,
      object: rel.object
    }));

    await fgaSdk.write({
      deletes: { tuple_keys: tupleKeys }
    });
  }

  static async checkMultipleRelationships(checks: RelationshipCheck[]): Promise<CheckResponse[]> {
    const results = [];
    for (const check of checks) {
      const result = await fgaSdk.check({
        tuple_key: {
          user: check.user,
          relation: check.relation,
          object: check.object
        }
      });
      results.push({
        ...check,
        allowed: result.allowed
      });
    }
    return results;
  }

  // Utility Methods
  static async getUserRelationships(
    userId: string, 
    relation?: string, 
    objectType?: string
  ): Promise<TupleKey[]> {
    const tupleKey: Partial<OpenFGATupleKey> = {
      user: `user:${userId}`
    };
    
    if (relation) tupleKey.relation = relation;
    if (objectType) tupleKey.object = objectType;

    const request: ReadRequest = { tuple_key: tupleKey };
    const response = await fgaSdk.read(request) as ReadResponse;
    
    return (response.tuples || []).map(mapOpenFGATupleToTupleKey);
  }

  // Complete Entity Setup Methods
  static async setupOrganization(params: Required<Pick<FGARelationshipParams, 'organizationId' | 'userId'>>): Promise<void> {
    if (!params.organizationId || !params.userId) {
      throw new Error('Missing required parameters');
    }
    await this.addOrganizationAdmin(params.userId, params.organizationId);
  }

  static async setupTeam(params: Required<Pick<FGARelationshipParams, 'teamId' | 'organizationId' | 'userId'>>): Promise<void> {
    if (!params.teamId || !params.organizationId || !params.userId) {
      throw new Error('Missing required parameters');
    }
    await this.setTeamParent(params.organizationId, params.teamId);
    await this.addTeamAdmin(params.userId, params.teamId);
  }

  static async setupProject(projectId: string, teamId: string, adminId: string): Promise<void> {
    await this.setProjectParent(teamId, projectId);
    await this.addProjectAdmin(adminId, projectId);
  }

  static async setupExcelFile(excelFileId: string, projectId: string, ownerId: string): Promise<void> {
    await this.setExcelFileParent(projectId, excelFileId);
    await this.setExcelFileOwner(ownerId, excelFileId);
  }

  static async setupAnalysis(analysisId: string, projectId: string, creatorId: string): Promise<void> {
    await this.setAnalysisParent(projectId, analysisId);
    await this.setAnalysisCreator(creatorId, analysisId);
  }

  static async setupResult(resultId: string, analysisId: string): Promise<void> {
    await this.setResultParent(analysisId, resultId);
  }

  static async setupDataChat(dataChatId: string, excelFileId: string): Promise<void> {
    await this.setDataChatParent(excelFileId, dataChatId);
  }
}

export default fgaUtils;
