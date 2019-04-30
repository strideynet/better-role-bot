import { fetchGuild, fetchRoles, fetchCategories, createCategory, fetchHeldRoles } from '../api'

const stateTemplate = {
  selected: {
    guild: {
      snowflake: '',
      name: '',
      iconHash: '',
      syncedAt: ''
    },
    roles: [],
    categories: [],
    heldRoles: []
  }
}

const mutations = {
  setGuild: (state, guild) => {
    state.selected.guild = guild
  },
  setRoles: (state, roles) => {
    state.selected.roles = roles
  },
  setCategories: (state, categories) => {
    state.selected.categories = categories
  },
  appendCategory: (state, category) => {
    state.selected.categories.push(category)
  },
  setHeldRoles: (state, heldRoles) => {
    state.selected.heldRoles = heldRoles
  }
}

const actions = {
  fetchGuild: async ({ commit, dispatch }, snowflake) => {
    dispatch('wait/start', 'guilds.fetchGuild', { root: true })

    try {
      commit('setGuild', await fetchGuild(snowflake))
    } catch (e) {
      commit('setGuild', stateTemplate.selected.guild)
      dispatch('alerts/throwError', e, { root: true })
    } finally {
      dispatch('wait/end', 'guilds.fetchGuild', { root: true })
    }
  },
  fetchRoles: async ({ commit, dispatch, state }) => {
    dispatch('wait/start', 'guilds.fetchRoles', { root: true })

    try {
      commit('setRoles', await fetchRoles(state.selected.guild.snowflake))
    } catch (e) {
      commit('setRoles', stateTemplate.selected.roles)
      dispatch('alerts/throwError', e, { root: true })
    } finally {
      dispatch('wait/end', 'guilds.fetchRoles', { root: true })
    }
  },
  fetchCategories: async ({ commit, dispatch, state }) => {
    dispatch('wait/start', 'guilds.fetchCategories', { root: true })

    try {
      commit('setCategories', await fetchCategories(state.selected.guild.snowflake))
    } catch (e) {
      commit('setCategories', stateTemplate.selected.categories)
      dispatch('alerts/throwError', e, { root: true })
    } finally {
      dispatch('wait/end', 'guilds.fetchCategories', { root: true })
    }
  },
  createCategory: async ({ commit, dispatch, state }, category) => {
    dispatch('wait/start', 'guilds.createCategory', { root: true })

    try {
      commit('appendCategory', await createCategory(state.selected.guild.snowflake, category))
    } catch (e) {
      dispatch('alerts/throwError', e, { root: true })
    } finally {
      dispatch('wait/end', 'guilds.createCategory', { root: true })
    }
  },
  fetchHeldRoles: async ({ commit, dispatch, state }) => {
    dispatch('wait/start', 'guilds.fetchHeldRoles', { root: true })

    try {
      commit('setHeldRoles', await fetchHeldRoles(state.selected.guild.snowflake))
    } catch (e) {
      commit('setHeldRoles', stateTemplate.selected.heldRoles)
      dispatch('alerts/throwError', e, { root: true })
    } finally {
      dispatch('wait/end', 'guilds.fetchHeldRoles', { root: true })
    }
  },
  fetchGuildData: async ({ commit, dispatch }, guildId) => {
    dispatch('wait/start', 'guilds.fetchGuildData', { root: true })

    try {
      await dispatch('fetchGuild', guildId)

      await Promise.all([
        dispatch('fetchRoles'),
        dispatch('fetchCategories'),
        dispatch('fetchHeldRoles')])
    } finally {
      dispatch('wait/end', 'guilds.fetchGuildData', { root: true })
    }
  }
}

const getters = {
  isGuildAdmin: state => {
    for (const role of state.selected.roles) {
      if (state.selected.heldRoles.includes(role.snowflake)) {
        if ((role.permissions & 8) === 8) {
          return true
        }
      }
    }

    return false
  }
}

const module = {
  namespaced: true,
  state: stateTemplate,
  mutations,
  actions,
  getters
}

export default module
