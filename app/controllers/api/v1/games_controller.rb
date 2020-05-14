class Api::V1::GamesController < ApiController
  def index
    render json: Game.all
  end

  def create
    name_entered = params["name"]
    game = Game.new()
    game.name = params["name"]
    game.url = name_entered.gsub(/[^0-9A-Za-z ]/, '').gsub(" ", "-").downcase
    game.round = 0
    game.current_team = "Blue"

    if game.save
      render json: game
    else
      render json: {
        errors: game.errors.messages,
        fields: {
          game: game
        }
      }
    end
  end

  def show
    current_game = Game.find_by(url: params[:id])

    if current_game
      render json: current_game
    else
      render json: {errors: ["Game not found. Please try again."]}
    end
  end

  def update
    current_game = Game.find_by(url: params[:id])
    current_game.seconds_remaining = params["remainingTime"]
    if current_game.save
      render json: {success: "Updated seconds remaining"}
    else
      render json: {errors: "Could not update seconds remaining"}
    end
  end
end
