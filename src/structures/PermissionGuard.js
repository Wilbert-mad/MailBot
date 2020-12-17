// !NOTE: Subjective to change in time. 
class PermissionGuard {
  /**
   * check command permissions
   * @param {import('discord.js').PermissionResolvable[]} memberPermissions
   * @param {import('discord.js').PermissionResolvable[]} clientPermissions
   */
  constructor(memberPermissions = [], clientPermissions = ['SEND_MESSAGES']) {
    this.memberPermissions = memberPermissions;
    this.clientPermissions = clientPermissions;
  }

  /**
   * @param {import('discord.js').GuildMember} member
   */
  check(member) {
    member.permissions.toArray().includes(this);
  }
}

module.exports = PermissionGuard;
