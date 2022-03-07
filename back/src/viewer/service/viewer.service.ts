import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Cat, CatDocument } from '../models/schemas/cat.schema';
import { Model } from 'mongoose';
import { CreateCatDto } from '../models/dto/createCat.dto';
import { from, Observable } from 'rxjs';

@Injectable()
export class ViewerService {}
