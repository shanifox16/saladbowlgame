class Api::V1::RoundsController < ApiController
  def index
    render json: Game.find_by(url: params["game_id"]).round
  end

  def update
    current_game = Game.find_by(url: params["game_id"])
    if current_game.round == 0
      current_game.round = 1
    elsif current_game.round == 1
      current_game.round = 2
    elsif current_game.round == 2
      current_game.round = 3
    elsif current_game.round == 3
      current_game.round = 4
    end

    if current_game.save
      render json: current_game
    else
      render json: {error: "Could not change the round - oops"}
    end
  end
end
