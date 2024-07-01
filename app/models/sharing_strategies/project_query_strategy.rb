module SharingStrategies
  class ProjectQueryStrategy
    attr_reader :project_query

    def initialize(project_query:)
      @project_query = project_query
    end

    def available_roles
      ProjectQueryRole.all.map.with_index do |role, index|
        {
          label: role.name,
          value: role.id,
          description: "#{role.name} description", # TODO: Figure out from where we can get the description
          default: index.zero?
        }
      end
    end

    def sharing_manageable?
      @project_query.editable?
    end

    def create_contract_class
      # Shares::WorkPackages::CreateContract
      EmptyContract
    end

    def update_contract_class
      # Shares::WorkPackages::UpdateContract
      EmptyContract
    end

    def delete_contract_class
      # Shares::WorkPackages::DeleteContract
      EmptyContract
    end
  end
end
