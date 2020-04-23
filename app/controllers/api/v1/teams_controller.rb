class Api::V1::TeamsController < ApiController
  def update
    team = Team.first
    if team.name == "Blue"
      team.name = "Red"
    else
      team.name = "Blue"
    end

    if team.save
      render json: team
    else
      render json: {error: "Could not change the team - oops"}
    end
  end
end
