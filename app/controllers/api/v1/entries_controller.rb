class Api::V1::EntriesController < ApiController
  def index
    current_entries = []
    current_round = Round.first
    entries = Entry.all
    entries.each do |entry|
      if current_round.number == 3
        if entry["round_three_is_complete"] == false && entry["is_deleted"] == false
          current_entries << entry
        end
      elsif current_round.number == 2
        if entry["round_two_is_complete"] == false && entry["is_deleted"] == false
          current_entries << entry
        end
      else
        if entry["round_one_is_complete"] == false && entry["is_deleted"] == false
          current_entries << entry
        end
      end
    end

    render json: current_entries
  end

  def create
    entries = []
    entryOne = Entry.new(name: params["entryOne"])
    entryTwo = Entry.new(name: params["entryTwo"])
    entryThree = Entry.new(name: params["entryThree"])
    entryFour = Entry.new(name: params["entryFour"])
    entryFive = Entry.new(name: params["entryFive"])
    if entryOne.save
      entries.push(entryOne)
    end
    if entryTwo.save
      entries.push(entryTwo)
    end
    if entryThree.save
      entries.push(entryThree)
    end
    if entryFour.save
      entries.push(entryFour)
    end
    if entryFive.save
      entries.push(entryFive)
    end

    if entries.length > 0
      render json: entries
    else
      render json: {
        errors: entryOne.errors.messages,
        fields: {
          entryOne: entryOne,
          entryTwo: entryTwo,
          entryThree: entryThree,
          entryFour: entryFour,
          entryFive: entryFive,
        }
      }
    end
  end

  def update
    entry = Entry.find(params[:id])
    current_round = Round.first
    if current_round.number == 3
      entry.round_three_is_complete = true
      entry.round_three_winner = Team.first.name
    elsif current_round.number == 2
      entry.round_two_is_complete = true
      entry.round_two_winner = Team.first.name
    elsif current_round.number == 1
      entry.round_one_is_complete = true
      entry.round_one_winner = Team.first.name
    end

    if entry.save
      render json: entry
    else
      render json: {error: "Could not update your correct entry"}
    end
  end
end
