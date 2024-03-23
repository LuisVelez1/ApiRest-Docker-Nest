import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { CreateCatDto } from './dto/create-cat.dto';
import { UpdateCatDto } from './dto/update-cat.dto';
import { Repository } from 'typeorm';
import { Cat }  from './entities/cat.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Breed } from '../breeds/entities/breed.entity';
import { UserActiveInterface } from '../common/interfaces/user-active.interface';
import { Role } from '../common/enums/rol.enum';

@Injectable()
export class CatsService {

  constructor(

    @InjectRepository(Cat)
    private catRepository: Repository<Cat>,

    @InjectRepository(Breed)
    private breedRepository: Repository<Breed>,
    
    ){}

  async create(createCatDto: CreateCatDto, user: UserActiveInterface) {

    const breed = await this.validateBreed(createCatDto.breed);

    return await this.catRepository.save({
      ...createCatDto, 
      breed: breed,
      userEmail: user.email,
    }); 
  }

  async findAll(user: UserActiveInterface) {
    if(user.role === Role.ADMIN){
      return await this.catRepository.find();
    }
    return await this.catRepository.find({
      where: { userEmail: user.email },
    });
  }

  async findOne(id: number, user: UserActiveInterface) {

    const cat = await this.catRepository.findOneBy({id});

    if(!cat){
      throw new BadRequestException('Cat Not found');
    }

    this.validateOwnership(cat, user);

    return cat;
    
  }

  async update(id: number, updateCatDto: UpdateCatDto, user: UserActiveInterface) {
   
    await this.findOne(id, user);


    return await this.catRepository.update(id, {
      ...updateCatDto,
      breed: updateCatDto.breed ? await this.validateBreed(updateCatDto.breed): undefined,
      userEmail: user.email,
    });
  }

  async remove(id: number, user: UserActiveInterface) {
    await this.findOne(id, user);
    return await this.catRepository.softDelete({ id });
  }

  private validateOwnership(cat: Cat, user: UserActiveInterface){
    if(user.role != Role.ADMIN && cat.userEmail !== user.email){
      throw new UnauthorizedException();
    }
  }

  private async validateBreed(breed: string){
    const breedEntity = await this.catRepository.findOneBy({ name: breed});

    if(!breedEntity){
      throw new BadRequestException('Breed not found');
    }

    return breedEntity;
  }

}
