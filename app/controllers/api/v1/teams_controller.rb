class Api::V1::TeamsController < ApiController
  def update
    current_game = Game.find_by(url: params["game_id"])
    if current_game.current_team == "Blue"
      current_game.current_team = "Red"
    else
      current_game.current_team = "Blue"
    end

    if current_game.save
      render json: current_game
    else
      render json: {error: "Could not change the team - oops"}
    end
  end
end
